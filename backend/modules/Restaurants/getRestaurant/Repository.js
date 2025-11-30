import restaurantModel from '../../../models/restaurantModel.js'

class RestaurantRepository {    
    async getRestaurantById (id) {
        return await restaurantModel.findById(id)
    }
}
export default new RestaurantRepository()
