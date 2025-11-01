import userModel from '../../../models/userModel.js'

class UserRepository {
    async findAll() {
        // Exclude password field
        return await userModel.find({}, { password: 0 })
    }
}

export default new UserRepository()
