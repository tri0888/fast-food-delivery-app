import foodRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class FoodService {
    async getAllFoods () {
        return await foodRepository.findAll()        
    }
}

export default new FoodService()
