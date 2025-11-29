import AppError from '../../../utils/appError.js'
import deleteRestaurantRepository from './Repository.js'
import { releaseDroneToIdle } from '../../Orders/droneTracking/droneTrackingService.js'

class DeleteRestaurantService {
    async deleteRestaurant(restaurantId) {
        if (!restaurantId) {
            throw new AppError('Restaurant id is required', 400)
        }

        try {
            const restaurant = await deleteRestaurantRepository.findRestaurantById(restaurantId)
            if (!restaurant) {
                throw new AppError('Restaurant not found', 404)
            }

            const orderCount = await deleteRestaurantRepository.countOrdersByRestaurant(restaurantId)
            if (orderCount > 0) {
                throw new AppError(`Cannot delete this restaurant because ${orderCount} order(s) are still linked to it.`, 400)
            }

            const [foodDocs, droneDocs] = await Promise.all([
                deleteRestaurantRepository.getFoodIdsByRestaurant(restaurantId),
                deleteRestaurantRepository.getDronesByRestaurant(restaurantId)
            ])

            if (droneDocs.length) {
                await Promise.all(droneDocs.map((drone) => releaseDroneToIdle(drone._id.toString())))
            }

            const [foodsResult, usersResult] = await Promise.all([
                deleteRestaurantRepository.deleteFoodsByRestaurant(restaurantId),
                deleteRestaurantRepository.deleteUsersByRestaurant(restaurantId)
            ])

            if (foodDocs.length) {
                const normalizedIds = foodDocs.map((doc) => doc._id || doc)
                await deleteRestaurantRepository.removeFoodsFromCarts(normalizedIds)
            }

            const dronesResult = await deleteRestaurantRepository.deleteDronesByRestaurant(restaurantId)

            await deleteRestaurantRepository.deleteRestaurantById(restaurantId)

            return {
                success: true,
                restaurantId,
                deleted: {
                    foods: foodsResult?.deletedCount || 0,
                    drones: dronesResult?.deletedCount || 0,
                    users: usersResult?.deletedCount || 0
                }
            }
        } catch (error) {
            throw error
        }
    }
}

export default new DeleteRestaurantService()
