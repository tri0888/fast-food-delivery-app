import orderModel from '../../../models/orderModel.js'

class OrderRepository {
    async findOrderById(id) {
        return await orderModel.findById(id)
    }

    async updateStatus(orderId, status) {
        return await orderModel.findByIdAndUpdate(orderId, { status })
    }
}

export default new OrderRepository()
