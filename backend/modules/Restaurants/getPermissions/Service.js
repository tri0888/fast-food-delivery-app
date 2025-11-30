import restaurantRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class RestaurantService {
    async getPermissions(user) {
        // SuperAdmin has all permissions
        if (user.role === 'superadmin') {
            return {
                food: { add_food: true, edit_food: true, list_food: true, remove_food: true },
                orders: { list: true, update_status: true },
                users: { add_user: true, edit_user: true, get_all_users: true, toggle_cart_lock: true },
                restaurant: { edit_restaurant: true }
            }
        }
        
        // Admin permissions from restaurant
        if (user.role === 'admin' && user.res_id) {
            const restaurant = await restaurantRepository.findRestaurantById(user.res_id)
            if (!restaurant) {
                throw new AppError('Restaurant not found', 404)
            }
            return restaurant.permissions
        }
        
        // Default no permissions
        return {
            food: { add_food: false, edit_food: false, list_food: false, remove_food: false },
            orders: { list: false, update_status: false },
            users: { add_user: false, edit_user: false, get_all_users: false, toggle_cart_lock: false },
            restaurant: { edit_restaurant: false }
        }
    }
}

export default new RestaurantService()
