import orderModel from '../../../models/orderModel.js'
import foodModel from '../../../models/foodModel.js'
import userModel from '../../../models/userModel.js'

class OrderRepository {
    findById(orderId) {
        return orderModel.findById(orderId)
    }

    findByIds(orderIds) {
        return orderModel.find({ _id: { $in: orderIds } })
    }

    findByStripeSessionId(sessionId) {
        return orderModel.find({ stripeSessionId: sessionId })
    }

    markPaymentAuthorized(orderId, { paymentIntentId, sessionId }) {
        return orderModel.findByIdAndUpdate(orderId, {
            paymentStatus: 'authorized',
            stripePaymentIntent: paymentIntentId,
            stripeSessionId: sessionId
        }, { new: true })
    }

    restoreStock(reservations) {
        const operations = reservations.map(({ foodId, quantity }) => (
            foodModel.findByIdAndUpdate(foodId, { $inc: { stock: quantity } })
        ))
        return Promise.all(operations)
    }

    deleteOrders(orderIds) {
        return orderModel.deleteMany({ _id: { $in: orderIds } })
    }

    clearUserCart(userId) {
        return userModel.findByIdAndUpdate(userId, { cartData: {} })
    }
}

export default new OrderRepository()
