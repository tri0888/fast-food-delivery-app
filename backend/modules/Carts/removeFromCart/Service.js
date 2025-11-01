import cartRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class CartService {
    async removeFromCart(userId, foodId, removeCompletely) {
        const userData = await cartRepository.findUserById(userId)

        if (!userData) {
            throw new AppError('User not found', 404)
        }

        const cartData = userData.cartData

        if (removeCompletely) {
            // Remove the item completely from cart
            delete cartData[foodId]
        } else {
            // Decrease quantity by 1
            if (cartData[foodId] && cartData[foodId] > 0) {
                cartData[foodId] -= 1
            }
            // If quantity becomes 0, remove the item
            if (cartData[foodId] === 0) {
                delete cartData[foodId]
            }
        }

        return await cartRepository.updateCart(userId, cartData)
    }
}

export default new CartService()

