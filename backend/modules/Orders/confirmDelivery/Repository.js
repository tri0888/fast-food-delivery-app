import orderModel from '../../../models/orderModel.js'

class ConfirmDeliveryRepository {
    async findOrderById(id) {
        return await orderModel.findById(id)
    }

    async markDelivered(orderId) {
        return await orderModel.findByIdAndUpdate(orderId, {
            status: 'Delivered',
            paymentStatus: 'captured',
            deliveredAt: new Date()
        }, { new: true })
    }
}

export default new ConfirmDeliveryRepository()
