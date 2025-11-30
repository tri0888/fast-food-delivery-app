import userModel from '../../../models/userModel.js'

class UserRepository {
    async findById(id) {
        return await userModel.findById(id)
    }

    async updateCartLock(id, restaurantId, isLocked) {
        const update = isLocked
            ? { $set: { [`cartLocks.${restaurantId}`]: true } }
            : { $unset: { [`cartLocks.${restaurantId}`]: "" } }

        return await userModel.findByIdAndUpdate(id,
                                                update,
                                                { new: true })
    }
}

export default new UserRepository()
