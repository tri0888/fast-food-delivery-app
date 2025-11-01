import orderModel from '../../../models/orderModel.js'
import userModel from '../../../models/userModel.js'
import foodModel from '../../../models/foodModel.js'

class OrderRepository {
    async findUserById(id) {
        return await userModel.findById(id)
    }

    async findFoodById(id) {
        return await foodModel.findById(id)
    }

    async reserveStock(item) {
        await foodModel.findByIdAndUpdate(item._id, 
                                         {$inc: { stock: -item.quantity }})
    }

    async createOrder(orderData) {
        const order = new orderModel(orderData)
        return await order.save()
    }

    async clearUserCart(userId) {
        return await userModel.findByIdAndUpdate(userId, { cartData: {} })
    }
}

export default new OrderRepository()
