import orderModel from '../../../models/orderModel.js'

class OrderRepository {
    async findAll(filter = {}) {
        return await orderModel.find(filter)
    }
}

export default new OrderRepository()
