import cartRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import { isRestaurantLocked } from '../../../utils/cartLockUtils.js'
// import { isRestaurantLocked } from '../../../utils/cartLockUtils.js'

class CartService {
    async createCart (userId, foodId) {
        const userData = await cartRepository.findUserById(userId)
        const foodData = await cartRepository.findFoodById(foodId)

        if (!userData) {
            throw new AppError('User not found', 404)
        }

        if (!foodData) {
            throw new AppError('Food not found', 404)
        }

        const restaurantId = foodData.res_id?.toString()

        if (!restaurantId) {
            throw new AppError('Food is not associated with a restaurant', 400)
        }

        if (isRestaurantLocked(userData.cartLocks, restaurantId)) {
            throw new AppError('Cart is locked for this restaurant. Please contact admin.', 403)
        }

        if (isRestaurantLocked(userData.cartLocks, foodData.res_id)) {
            throw new AppError('This restaurant is temporarily locked by admin', 403)
        }

        const cartData = await userData.cartData;
        if (!cartData[foodId]) {
            cartData[foodId] = 1
        } else {
            cartData[foodId] += 1
        }

        return await cartRepository.create(userId, cartData)
    }
}

export default new CartService()