import foodRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class FoodService {
    async createFood (foodData, image) {
        const { name, description, price, category, stock } = foodData
        
        if (!name || !description || !price || !category || stock === undefined) {
            throw new AppError('Food information cannot be left blank', 400)
        }

        const image_filename = image ? image.filename : null
        if (!image_filename) {
            throw new AppError('Image is required', 400)
        }

        if (price <= 0) {
            throw new AppError('Price must be greater than 0', 400)
        }

        if (stock < 0) {
            throw new AppError('Stock cannot be negative', 400)
        }

        const newFoodData = {name        : foodData.name,
                                description : foodData.description,
                                price       : foodData.price,
                                category    : foodData.category,
                                image       : image_filename,
                                isAvailable : foodData.isAvailable !== undefined ? foodData.isAvailable : true,
                                stock       : foodData.stock}

        return await foodRepository.create(newFoodData)
    }
}

export default new FoodService()