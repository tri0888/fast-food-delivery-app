import orderModel from '../../../models/orderModel.js'
import foodModel from '../../../models/foodModel.js'

class OrderRepository {
    async findOrderById(id) {
        return await orderModel.findById(id)
    }

    async updateStatus(orderId, status, extra = {}) {
        return await orderModel.findByIdAndUpdate(orderId, { status, ...extra }, { new: true })
    }

    async restoreStock(items) {
        for (const item of items) {
            await foodModel.findByIdAndUpdate(item.foodId, {
                $inc: { stock: item.quantity }
            })
        }
    }
}

export default new OrderRepository()
