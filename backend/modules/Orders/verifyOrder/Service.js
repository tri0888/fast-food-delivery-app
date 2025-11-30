import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import stripeAdapter from '../../Payment/stripeAdapter.js'

const SETTLED_STATUSES = ['authorized', 'captured']

class OrderService {
    async verifyOrder({ orderIds = [], success, sessionId }) {
        const normalizedSuccess = success === 'true' || success === true

        if (!sessionId && (!Array.isArray(orderIds) || orderIds.length === 0)) {
            throw new AppError('Stripe session ID or order IDs are required', 400)
        }

        let orders = []
        if (sessionId) {
            orders = await orderRepository.findByStripeSessionId(sessionId)
        }

        if (orders.length === 0 && Array.isArray(orderIds) && orderIds.length > 0) {
            orders = await orderRepository.findByIds(orderIds)
        }

        if (orders.length === 0) {
            throw new AppError('Orders not found for this payment session', 404)
        }

        if (normalizedSuccess) {
            return {
                success: true,
                message: 'Payment initiated. We will confirm once Stripe webhook notifies us.'
            }
        }

        const alreadyProcessed = orders.some((order) => SETTLED_STATUSES.includes(order.paymentStatus))
        if (alreadyProcessed) {
            return {
                success: true,
                message: 'Payment already processed. Your orders will appear shortly.'
            }
        }

        await this.cancelOrders(orders)
        return {
            success: false,
            message: 'Payment cancelled'
        }
    }

    async cancelOrders(orders) {
        const aggregatedReservations = new Map()
        for (const order of orders) {
            for (const item of order.food_items || []) {
                if (!item.foodId) {
                    continue
                }
                const key = item.foodId.toString()
                const current = aggregatedReservations.get(key) || 0
                aggregatedReservations.set(key, current + item.quantity)
            }
        }

        const reservations = Array.from(aggregatedReservations.entries()).map(([foodId, quantity]) => ({
            foodId,
            quantity
        }))

        if (reservations.length > 0) {
            await orderRepository.restoreStock(reservations)
        }

        const paymentIntents = [...new Set(
            orders
                .map((order) => order.stripePaymentIntent)
                .filter(Boolean)
        )]

        for (const intentId of paymentIntents) {
            try {
                await stripeAdapter.cancelPayment(intentId)
            } catch (err) {
                console.error('Failed to cancel Stripe payment intent', err.message)
            }
        }

        const orderIds = orders.map((order) => order._id)
        await orderRepository.deleteOrders(orderIds)
    }
}

export default new OrderService()
