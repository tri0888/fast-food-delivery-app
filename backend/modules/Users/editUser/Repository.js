import userModel from '../../../models/userModel.js'

class UserRepository {
    async findById(id) {
        return await userModel.findById(id)
    }

    async updateById(id, updateData) {
        return await userModel.findByIdAndUpdate(id,
                                                updateData,
                                                { new: true })
    }
}

export default new UserRepository()
