import foodRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import fs from 'fs'

class FoodService {
    async deleteFood(id) {
        const food = await foodRepository.findById(id)
        if (!food) {
            throw new AppError('Food not found', 400)
        }

        const orderCount = await foodRepository.countOrdersWithFood(food._id)
        if (orderCount > 0) {
            throw new AppError('Cannot delete this food because existing orders contain it.', 400)
        }

        fs.unlink(`uploads/${food.image}`,()=>{})

        await foodRepository.deleteById(id)
        return food
    }
}

export default new FoodService()
