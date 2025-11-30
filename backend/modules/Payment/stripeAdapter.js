import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null

const ensureStripeClient = () => {
    if (!stripe) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    return stripe
}

const trimTrailingSlashes = (value = '') => value.replace(/\/+$/, '')

class StripeAdapter {
    async createCheckoutSession({ referenceId, orderIdsParam, rawOrderIds, items = [], frontendUrl, deliveryFee = 2, metadata = {} }) {
        

        if (!referenceId) {
            throw new Error('Reference ID is required to create checkout session')
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Cannot create checkout session without items')
        }

        if (!frontendUrl) {
            throw new Error('Frontend URL is required to build redirect links')
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Delivery Charges"
                    },
                    unit_amount: Math.round(deliveryFee * 100)
                },
                quantity: 1
            })
        }
        const normalizedFrontend = trimTrailingSlashes(frontendUrl)
        const orderIdQuery = orderIdsParam ? `&orderId=${orderIdsParam}` : ''
        const successUrl = `${normalizedFrontend}/verify?success=true${orderIdQuery}&session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl = `${normalizedFrontend}/verify?success=false${orderIdQuery}&session_id={CHECKOUT_SESSION_ID}`

        const finalMetadata = { ...metadata }
        if (rawOrderIds) {
            finalMetadata.order_ids = rawOrderIds
        } else if (!finalMetadata.order_ids && orderIdsParam) {
            finalMetadata.order_ids = orderIdsParam
        }

        const client = ensureStripeClient()
        const session = await client.checkout.sessions.create({
            line_items,
            mode: 'payment',
            client_reference_id: referenceId,
            payment_intent_data: {
                capture_method: 'manual'
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: finalMetadata
        })

        const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id

        return {
            url: session.url,
            sessionId: session.id,
            paymentIntentId
        }
    }

    async retrieveSession(sessionId) {
        if (!sessionId) {
            throw new Error('Session ID is required')
        }
        const client = ensureStripeClient()
        return client.checkout.sessions.retrieve(sessionId)
    }

    async capturePayment(paymentIntentId) {
        if (!paymentIntentId) {
            throw new Error('Payment intent ID is required to capture payment')
        }
        const client = ensureStripeClient()
        return client.paymentIntents.capture(paymentIntentId)
    }

    async cancelPayment(paymentIntentId) {
        if (!paymentIntentId) {
            throw new Error('Payment intent ID is required to cancel payment')
        }
        const client = ensureStripeClient()
        return client.paymentIntents.cancel(paymentIntentId)
    }

    verifyWebhook(rawBody, signature) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!endpointSecret) {
            throw new Error('Stripe webhook secret not configured')
        }
        const client = ensureStripeClient()
        return client.webhooks.constructEvent(rawBody, signature, endpointSecret)
    }
}

export default new StripeAdapter()
