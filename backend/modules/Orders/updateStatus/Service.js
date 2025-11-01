import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class OrderService {
    async updateOrderStatus(orderId, status) {

        const order = await orderRepository.findOrderById(orderId)
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (!status) {
            throw new AppError('Status is required', 400)
        }

        const validStatuses = ['Food Processing', 'Out for delivery', 'Delivered']
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status', 400)
        }

        return await orderRepository.updateStatus(orderId, status)
    }
}

export default new OrderService()
