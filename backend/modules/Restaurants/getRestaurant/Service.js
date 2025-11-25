import restaurantRepository from './Repository.js'

class RestaurantService {    
    async getRestaurant(id) {
        return await restaurantRepository.getRestaurantById(id)
    }
}

export default new RestaurantService()

