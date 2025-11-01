import userModel from '../../../models/userModel.js'
import foodModel from '../../../models/foodModel.js'

class CartRepository {
    async findUserById(id) {
        return await userModel.findById(id)
    }

    async findFoodById(id) {
        return await foodModel.findById(id)
    }

    async create(userId, cartData) {
        return await userModel.findByIdAndUpdate(userId,
                                                {cartData})
    }
}

export default new CartRepository()
