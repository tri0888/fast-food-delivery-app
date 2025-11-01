import userModel from '../../../models/userModel.js'

class UserRepository {
    async findByEmail(email) {
        return await userModel.findOne({ email })
    }

    async create(userData) {
        const user = new userModel(userData)
        return await user.save()
    }
}

export default new UserRepository()
