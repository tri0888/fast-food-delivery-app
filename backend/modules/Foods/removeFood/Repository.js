import foodModel from '../../../models/foodModel.js'

class FoodRepository {
    async findById(id) {
        return await foodModel.findById(id)
    }

    async deleteById(id) {
        return await foodModel.findByIdAndDelete(id)
    }
}

export default new FoodRepository()
