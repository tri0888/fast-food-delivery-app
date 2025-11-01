import cartRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

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