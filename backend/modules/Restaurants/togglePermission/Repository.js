import restaurantModel from '../../../models/restaurantModel.js'

class RestaurantRepository {    
    async updateRestaurant (id, data) {
        return await restaurantModel.findByIdAndUpdate(id, data, { new: true })
    }
}
export default new RestaurantRepository()
