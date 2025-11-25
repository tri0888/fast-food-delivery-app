import stripeAdapter from '../stripeAdapter.js'
import orderRepository from '../../Orders/verifyOrder/Repository.js'
import orderService from '../../Orders/verifyOrder/Service.js'

const SUCCESS_EVENT_TYPES = new Set([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded'
])

const FAILURE_EVENT_TYPES = new Set([
    'checkout.session.expired',
    'checkout.session.async_payment_failed'
])

const SETTLED_STATUSES = ['authorized', 'captured']

class StripeWebhookService {
    async processEvent(rawBody, signature) {
        if (!signature) {
            throw new Error('Missing Stripe signature header')
        }

        const event = stripeAdapter.verifyWebhook(rawBody, signature)
        
        const { type, data } = event
        const session = data?.object

        if (!session) {
            return { ignored: true }
        }

        if (SUCCESS_EVENT_TYPES.has(type)) {
            await this.handleCheckoutCompleted(session)
        } else if (FAILURE_EVENT_TYPES.has(type)) {
            await this.handleCheckoutExpired(session)
        }

        return { received: true }
    }

    extractOrderIds(session) {
        const metadataValue = session?.metadata?.order_ids || ''
        let decodedValue = metadataValue
        try {
            decodedValue = decodeURIComponent(metadataValue)
        } catch (err) {
            // leave as-is if decode fails
        }
        return metadataValue
            ? decodedValue.split(',')
            .map((id) => id.trim())
            .filter(Boolean)
            : []
    }

    async handleCheckoutCompleted(session) {
        const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id

        let orders = []
        const orderIds = this.extractOrderIds(session)
        if (orderIds.length > 0) {
            orders = await orderRepository.findByIds(orderIds)
        }

        if (orders.length === 0 && session.id) {
            orders = await orderRepository.findByStripeSessionId(session.id)
        }

        if (orders.length === 0) {
            return
        }

        await Promise.all(orders.map((order) => {
            if (SETTLED_STATUSES.includes(order.paymentStatus)) {
                return null
            }
            return orderRepository.markPaymentAuthorized(order._id, {
                paymentIntentId: paymentIntentId || order.stripePaymentIntent,
                sessionId: session.id
            })
        }))

        const userIds = [...new Set(orders.map((order) => order.userId))].filter(Boolean)
        await Promise.all(userIds.map((userId) => orderRepository.clearUserCart(userId)))
    }

    async handleCheckoutExpired(session) {
        let orders = []
        if (session.id) {
            orders = await orderRepository.findByStripeSessionId(session.id)
        }

        if (orders.length === 0) {
            const orderIds = this.extractOrderIds(session)
            if (orderIds.length > 0) {
                orders = await orderRepository.findByIds(orderIds)
            }
        }

        if (orders.length === 0) {
            return
        }

        await orderService.cancelOrders(orders)
    }
}

export default new StripeWebhookService()
