import userModel from '../../../models/userModel.js'
import foodModel from '../../../models/foodModel.js'
import orderModel from '../../../models/orderModel.js'

class OrderRepository {
    async findUserById(id) {
        return userModel.findById(id)
    }

    async findFoodsByIds(ids) {
        return foodModel.find({ _id: { $in: ids } })
    }

    async reserveStock(foodId, quantity) {
        return foodModel.findOneAndUpdate(
            { _id: foodId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } }
        )
    }

    async restoreStock(reservations) {
        const operations = reservations.map(({ foodId, quantity }) => (
            foodModel.findByIdAndUpdate(foodId, { $inc: { stock: quantity } })
        ))
        await Promise.all(operations)
    }

    async createOrders(orderDocs) {
        return orderModel.insertMany(orderDocs)
    }

    async deleteOrders(orderIds) {
        return orderModel.deleteMany({ _id: { $in: orderIds } })
    }

    async attachStripeDetails(orderIds, { sessionId, paymentIntentId }) {
        return orderModel.updateMany({ _id: { $in: orderIds } }, {
            stripeSessionId: sessionId,
            stripePaymentIntent: paymentIntentId || null
        })
    }
}

export default new OrderRepository()
