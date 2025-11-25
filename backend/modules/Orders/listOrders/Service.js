import orderRepository from './Repository.js'

class OrderService {
    async getAllOrders(filter = {}) {
        const orders = await orderRepository.findAll(filter)
        
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
