import restaurantModel from '../../../models/restaurantModel.js'

class RestaurantRepository {
    async getAllRestaurants(filter = {}) {
        return await restaurantModel.find(filter)
    }
}

export default new RestaurantRepository()
