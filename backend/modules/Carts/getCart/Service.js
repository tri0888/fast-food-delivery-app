import cartRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class CartService {
    async getCart(userId) {
        const userData = await cartRepository.findUserById(userId)

        if (!userData) {
            throw new AppError('User not found', 404)
        }

        return {
            cartData     : userData.cartData,
            isCartLocked : userData.isCartLock
        }
    }
}

export default new CartService()

