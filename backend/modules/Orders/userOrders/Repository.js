import orderModel from '../../../models/orderModel.js'
import userModel from '../../../models/userModel.js'

class OrderRepository {
    async findUserById(id) {
        return await userModel.findById(id)
    }

    async findOrdersByUserId(userId) {
        return await orderModel
            .find({ userId })
            .populate('droneTracking.assignedDrone', 'name status res_id')
    }

}

export default new OrderRepository()
