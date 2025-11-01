import foodModel from '../../../models/foodModel.js'

class FoodRepository {
    async findById(id) {
        return await foodModel.findById(id)
    }

    async updateById(id, updateData) {
        return await foodModel.findByIdAndUpdate(id, 
                                                 updateData, 
                                                 { new: true })
    }
}

export default new FoodRepository()
