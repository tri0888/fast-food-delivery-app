import foodRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class FoodService {
    async updateFood(id, updateData, file) {
        delete updateData.id
        const food = await foodRepository.findById(id)
        if (!food) {
            throw new AppError('Food not found',400)
        }

        const { name, description, price, category, stock } = updateData
        if (!name || !description || !price || !category || stock === undefined) {
            throw new AppError('Food information cannot be left blank',400)
        }

        if (price <= 0) {
            throw new AppError('Price must be greater than 0',400)
        }

        if (stock < 0) {
            throw new AppError('Stock cannot be negative', 400)
        }

        updateData.updatedAt = Date.now()

        if (file && file.filename) {            
            updateData.image = file.filename
        }

        return await foodRepository.updateById(id, updateData)
    }
}

export default new FoodService()
