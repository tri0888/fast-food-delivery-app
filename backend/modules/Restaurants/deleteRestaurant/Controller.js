import deleteRestaurantService from './Service.js'

export const deleteRestaurant = async (req, res, next) => {
    try {
        const { restaurantId } = req.params
        const result = await deleteRestaurantService.deleteRestaurant(restaurantId)

        res.json({
            success: true,
            message: 'Restaurant and related data deleted successfully',
            data: result
        })
    } catch (error) {
        return next(error)
    }
}
