import orderModel from '../../../models/orderModel.js'

class OrderRepository {
    async findAll(filter = {}) {
        return await orderModel
            .find(filter)
            .populate('droneTracking.assignedDrone', 'name status res_id')
    }
}

export default new OrderRepository()
