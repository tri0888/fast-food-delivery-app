import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class OrderService {
    async getUserOrders(userId) {
        const user = await orderRepository.findUserById(userId)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        const orders = await orderRepository.findOrdersByUserId(userId)
        
        return orders.map((order) => {
            const orderObj = order.toObject()
            const items = orderObj.food_items || []
            return {
                ...orderObj,
                items,
                food_items: items
            }
        })
    }
}

export default new OrderService()
