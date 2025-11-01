import userModel from '../../../models/userModel.js'

class CartRepository {
    async findUserById(id) {
        return await userModel.findById(id)
    }

    async updateCart(userId, cartData) {
        return await userModel.findByIdAndUpdate(userId,
                                                { cartData },
                                                { new: true })
    }
}

export default new CartRepository()

