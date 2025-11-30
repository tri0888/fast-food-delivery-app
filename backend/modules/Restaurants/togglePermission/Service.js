import restaurantRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class RestaurantService {
    
    async togglePermission(id, module, action, value) {
        if (!module || !action || value === undefined) {
            throw new AppError('Module, action and value are required', 400)
        }
        
        const validModules = ['food', 'orders', 'users', 'restaurant']
        if (!validModules.includes(module)) {
            throw new AppError('Invalid module name', 400)
        }

        const updateData = {
            [`permissions.${module}.${action}`]: value
        }
        return await restaurantRepository.updateRestaurant(id, updateData)
    }
}

export default new RestaurantService()

