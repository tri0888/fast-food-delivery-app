import AppError from '../../../utils/appError.js'
import restaurantModel from '../../../models/restaurantModel.js'
import droneRepository from '../repository.js'

class AddDroneService {
    async create(input = {}) {
        const name = input.name?.trim()
        const restaurantId = input.res_id || input.restaurantId

        if (!name) {
            throw new AppError('Drone name is required', 400)
        }
        if (!restaurantId) {
            throw new AppError('Restaurant is required for a drone', 400)
        }

        const restaurant = await restaurantModel.findById(restaurantId)
        if (!restaurant) {
            throw new AppError('Restaurant not found', 404)
        }

        const payload = {
            name,
            res_id: restaurantId,
            status: 'idle',
            currentOrder: null,
            lastStatusChange: new Date(),
            returnETA: null
        }

        return droneRepository.create(payload)
    }
}

export default new AddDroneService()
