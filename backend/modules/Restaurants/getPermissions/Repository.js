import restaurantModel from '../../../models/restaurantModel.js'

class RestaurantRepository {
    async findRestaurantById(resId) {
        return await restaurantModel.findById(resId) 
    }
}

export default new RestaurantRepository()