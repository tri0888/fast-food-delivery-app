import cartRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import { cartLocksToObject } from '../../../utils/cartLockUtils.js'

class CartService {
    async getCart(userId) {
        const userData = await cartRepository.findUserById(userId)

        if (!userData) {
            throw new AppError('User not found', 404)
        }

        return {
            cartData          : userData.cartData,
            lockedRestaurants : cartLocksToObject(userData.cartLocks)
        }
    }
}

export default new CartService()

