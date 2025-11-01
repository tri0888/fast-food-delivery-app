import foodModel from '../../../models/foodModel.js'

class FoodRepository {
    async create(foodData) {
        const food = new foodModel(foodData)
        return await food.save()
    }
}

export default new FoodRepository()
