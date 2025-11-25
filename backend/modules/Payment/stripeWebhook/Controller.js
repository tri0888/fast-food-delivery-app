import stripeWebhookService from './Service.js'

const handleStripeWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature']
        await stripeWebhookService.processEvent(req.body, signature)
        res.json({ received: true })
    } catch (error) {
        console.error('Stripe webhook error:', error)
        res.status(400).send(`Webhook Error: ${error.message}`)
    }
}

export { handleStripeWebhook }
