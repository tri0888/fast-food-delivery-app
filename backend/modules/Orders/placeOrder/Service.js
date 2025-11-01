import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import stripeAdapter from '../../Payment/stripeAdapter.js'

class OrderService {
    async placeOrder(userId, items, amount, address, frontendUrl) {
        const user = await orderRepository.findUserById(userId)
        
        if (!user) {
            throw new AppError('User not found', 404)
        }

        if (!amount || !address) {
            throw new AppError('Please provide all required fields', 400)
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError('Order must contain at least one item', 400)
        }

        for (const item of items) {
            const food = await orderRepository.findFoodById(item._id)
            
            if (!food) {
                throw new AppError(`Food item ${item.name} not found`, 404)
            }
            
            if (food.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${item.name}`, 400)
            }

            await orderRepository.reserveStock(item)
        }

        const newOrder = await orderRepository.createOrder({userId,
                                                            items,
                                                            amount,
                                                            address})

        // Clear user cart
        await orderRepository.clearUserCart(userId)

        // Create Stripe checkout session
        const session_url = await stripeAdapter.createCheckoutSession(newOrder, frontendUrl)

        return { session_url }
    }
}

export default new OrderService()
