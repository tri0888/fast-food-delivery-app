import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

const STATUS_TRANSITIONS = {
    'Pending Confirmation': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Out for delivery', 'Cancelled'],
    'Out for delivery': [],
    'Delivered': [],
    'Cancelled': []
}

const normalizeStatus = (status) => {
    if (status === 'Food Processing') return 'Pending Confirmation'
    return status
}

class OrderService {
    async updateOrderStatus(orderId, status) {

        const order = await orderRepository.findOrderById(orderId)
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (!status) {
            throw new AppError('Status is required', 400)
        }

        const currentStatus = normalizeStatus(order.status)
        const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || []
        if (!allowedStatuses.includes(status)) {
            throw new AppError('Invalid status transition', 400)
        }

        if (status !== 'Cancelled' && !['authorized', 'captured'].includes(order.paymentStatus)) {
            throw new AppError('Cannot advance order before payment authorization', 400)
        }

        if (status === 'Cancelled') {
            const items = order.food_items || []
            if (items.length > 0) {
                await orderRepository.restoreStock(items)
            }

            return await orderRepository.updateStatus(orderId, 'Cancelled', {
                paymentStatus: 'failed',
                stripePaymentIntent: null,
                stripeSessionId: null
            })
        }

        return await orderRepository.updateStatus(orderId, status)
    }
}

export default new OrderService()
