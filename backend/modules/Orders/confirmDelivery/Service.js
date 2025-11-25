import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class ConfirmDeliveryService {
    async confirm(orderId, userId) {
        if (!orderId) {
            throw new AppError('Order ID is required', 400)
        }

        const order = await orderRepository.findOrderById(orderId)
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (order.userId !== userId) {
            throw new AppError('You cannot update this order', 403)
        }

        if (order.status !== 'Out for delivery') {
            throw new AppError('Order is not ready to be completed', 400)
        }

        if (order.paymentStatus === 'captured') {
            return { success: true }
        }

        if (order.paymentStatus !== 'authorized') {
            throw new AppError('Payment not authorized or already captured', 400)
        }

        await orderRepository.markDelivered(orderId)

        return { success: true }
    }
}

export default new ConfirmDeliveryService()
