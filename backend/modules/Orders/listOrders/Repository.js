import orderModel from '../../../models/orderModel.js'

class OrderRepository {
    async findAll() {
        return await orderModel.find({})
    }
}

export default new OrderRepository()
