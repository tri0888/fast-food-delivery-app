import foodModel from '../../../models/foodModel.js'
import orderModel from '../../../models/orderModel.js'

class FoodRepository {
    async findById(id) {
        return await foodModel.findById(id)
    }

    async deleteById(id) {
        return await foodModel.findByIdAndDelete(id)
    }

    async countOrdersWithFood(foodId) {
        return orderModel.countDocuments({ 'food_items.foodId': foodId })
    }
}

export default new FoodRepository()
