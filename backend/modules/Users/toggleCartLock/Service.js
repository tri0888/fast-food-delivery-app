import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class UserService {
    async toggleCartLock(userId) {
        const user = await userRepository.findById(userId)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        // Toggle cart lock status
        const newLockStatus = !user.isCartLock

        const updatedUser = await userRepository.updateById(userId, {
            isCartLock: newLockStatus
        })

        return updatedUser
    }
}

export default new UserService()
