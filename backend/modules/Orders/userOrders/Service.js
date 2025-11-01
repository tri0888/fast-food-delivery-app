import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class OrderService {
    async getUserOrders(userId) {
        const user = await orderRepository.findUserById(userId)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        return await orderRepository.findOrdersByUserId(userId)
    }
}

export default new OrderService()
