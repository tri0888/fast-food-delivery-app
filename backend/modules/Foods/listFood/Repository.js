import foodModel from '../../../models/foodModel.js'

class FoodRepository {
    async findAll() {
        return await foodModel.find({})
    }
}

export default new FoodRepository()
