import droneModel from '../../models/droneModel.js'

class DroneRepository {
    async findAll(filter = {}) {
        return droneModel
            .find(filter)
            .populate('res_id', 'name address')
            .populate({
                path: 'currentOrder',
                select: 'status amount address droneTracking createdAt updatedAt',
                populate: {
                    path: 'droneTracking.assignedDrone',
                    select: 'name status'
                }
            })
            .sort({ createdAt: 1 })
            .lean({ getters: true, virtuals: false })
    }

    async create(payload) {
        return droneModel.create(payload)
    }
}

export default new DroneRepository()
