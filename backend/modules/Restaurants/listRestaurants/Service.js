import restaurantRepository from './Repository.js'

class RestaurantService {
    async listRestaurants(filter = {}) {
        return await restaurantRepository.getAllRestaurants(filter)
    }
}

export default new RestaurantService()
