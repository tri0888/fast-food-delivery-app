import restaurantModel from '../../../models/restaurantModel.js'
import foodModel from '../../../models/foodModel.js'
import orderModel from '../../../models/orderModel.js'
import userModel from '../../../models/userModel.js'
import droneModel from '../../../models/droneModel.js'

class DeleteRestaurantRepository {
    findRestaurantById(id, session) {
        const query = restaurantModel.findById(id)
        return session ? query.session(session) : query
    }

    deleteRestaurantById(id, session) {
        return restaurantModel.findByIdAndDelete(id, { session })
    }

    getFoodIdsByRestaurant(restaurantId, session) {
        const query = foodModel.find({ res_id: restaurantId }).select('_id')
        return session ? query.session(session) : query
    }

    deleteFoodsByRestaurant(restaurantId, session) {
        return foodModel.deleteMany({ res_id: restaurantId }, { session })
    }

    deleteOrdersByRestaurant(restaurantId, session) {
        return orderModel.deleteMany({ res_id: restaurantId }, { session })
    }

    deleteUsersByRestaurant(restaurantId, session) {
        return userModel.deleteMany({ res_id: restaurantId }, { session })
    }

    getDronesByRestaurant(restaurantId, session) {
        const query = droneModel.find({ res_id: restaurantId }).select('_id')
        return session ? query.session(session) : query
    }

    deleteDronesByRestaurant(restaurantId, session) {
        return droneModel.deleteMany({ res_id: restaurantId }, { session })
    }

    async removeFoodsFromCarts(foodIds = [], session) {
        if (!foodIds.length) {
            return null
        }
        const unsetFields = foodIds.reduce((acc, foodId) => {
            const key = typeof foodId === 'object' && foodId !== null && '_id' in foodId
                ? foodId._id.toString()
                : foodId.toString()
            acc[`cartData.${key}`] = ''
            return acc
        }, {})
        return userModel.updateMany({}, { $unset: unsetFields }, { session })
    }
}

export default new DeleteRestaurantRepository()
