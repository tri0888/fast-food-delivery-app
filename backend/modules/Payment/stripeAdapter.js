import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

class StripeAdapter {
    async createCheckoutSession(order, frontendUrl) {
        const line_items = order.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontendUrl}/verify?success=true&orderId=${order._id}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${order._id}`
        })

        return session.url
    }

    verifyWebhook(rawBody, signature) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!endpointSecret) {
            throw new Error('Stripe webhook secret not configured')
        }
        return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)
    }
}

export default new StripeAdapter()
