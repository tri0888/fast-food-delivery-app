import userModel from '../../../models/userModel.js'

class UserRepository {
    async findByEmail(email) {
        return await userModel.findOne({ email })
    }
}

export default new UserRepository()
