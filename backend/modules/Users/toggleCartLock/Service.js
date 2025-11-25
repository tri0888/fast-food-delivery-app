import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import { cartLocksToObject, ensureCartLockMap } from '../../../utils/cartLockUtils.js'

class UserService {
    async toggleCartLock(userId, restaurantId) {
        if (!restaurantId) {
            throw new AppError('Restaurant context is required to toggle cart lock', 400)
        }

        const user = await userRepository.findById(userId)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        const cartLockMap = ensureCartLockMap(user.cartLocks)
        const currentStatus = Boolean(cartLockMap.get(String(restaurantId)))
        const newLockStatus = !currentStatus

        const updatedUser = await userRepository.updateCartLock(userId, restaurantId, newLockStatus)

        return {
            userId          : updatedUser._id,
            restaurantId,
            isLocked        : newLockStatus,
            lockedRestaurants : cartLocksToObject(updatedUser.cartLocks)
        }
    }
}

export default new UserService()
