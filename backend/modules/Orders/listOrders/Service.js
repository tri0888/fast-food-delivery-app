import orderRepository from './Repository.js'

class OrderService {
    async getAllOrders() {
        return await orderRepository.findAll()
    }
}

export default new OrderService()
