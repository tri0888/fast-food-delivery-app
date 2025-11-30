import restaurantModel from '../../../models/restaurantModel.js'
import userModel from '../../../models/userModel.js'

class RestaurantRepository {
    async createRestaurant (data) {
        return await restaurantModel.create(data)
    }
    async createUser(userData) {
        const user = new userModel(userData)
        return await user.save()
    }

    async findUser(email) {
        return await userModel.findOne({ email: email })
    }
    
    async updateRestaurant(id, data) {
        return await restaurantModel.findByIdAndUpdate(id, data, { new: true })
    }
}
export default new RestaurantRepository()
