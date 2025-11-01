import userModel from '../../../models/userModel.js'

class CartRepository {
    async findUserById(id) {
        return await userModel.findById(id)
    }
}

export default new CartRepository()

