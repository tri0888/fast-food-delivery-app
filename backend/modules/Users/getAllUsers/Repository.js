import userModel from '../../../models/userModel.js'

class UserRepository {
    async findAll(filter = {}) {
        // Exclude password field, apply restaurant filter if present
        return await userModel.find(filter, { password: 0 })
    }

    async findById(id) {
        return await userModel.findById(id, { password: 0 })
    }
}

export default new UserRepository()
