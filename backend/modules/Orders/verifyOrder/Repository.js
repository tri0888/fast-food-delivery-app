import orderModel from '../../../models/orderModel.js'
import foodModel from '../../../models/foodModel.js'

class OrderRepository {
    async findById(orderId) {
        return await orderModel.findById(orderId)
    }

    async updatePaymentStatus(orderId, paymentStatus) {
        return await orderModel.findByIdAndUpdate(orderId, { payment: paymentStatus })
    }

    async restoreStock(items) {
        // Restore stock for all items in the order
        for (const item of items) {
            await foodModel.findByIdAndUpdate(item._id, {
                $inc: { stock: item.quantity }
            })
        }
    }

    async deleteById(orderId) {
        return await orderModel.findByIdAndDelete(orderId)
    }
}

export default new OrderRepository()
