import foodModel from '../../../models/foodModel.js'

class FoodRepository {
    async findAll(filter = {}) {
        return await foodModel.find(filter)
    }
}

export default new FoodRepository()
