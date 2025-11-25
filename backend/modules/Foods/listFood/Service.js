import foodRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class FoodService {
    async getAllFoods (filter = {}) {
        return await foodRepository.findAll(filter)        
    }
}

export default new FoodService()
