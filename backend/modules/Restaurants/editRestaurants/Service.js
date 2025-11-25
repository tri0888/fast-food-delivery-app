import restaurantRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class RestaurantService {
    async editRestaurant(id, name, address, phone) {
        if (!id) {
            throw new AppError('Restaurant ID is required', 400)
        }
        if (!name || !address || !phone) {
            throw new AppError('Restaurant information cannot be left blank', 400)
        }
        
        const updateData = { name, address, phone }
        return await restaurantRepository.updateRestaurant(id, updateData)
    }
}

export default new RestaurantService()

