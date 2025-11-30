import restaurantService from './Service.js'

const editRestaurant = async (req, res, next) => {
    try {
        const { id, name, address, phone } = req.body
        const user = req.user
        
        // If admin, verify they're editing their own restaurant
        if (user.role === 'admin') {
            if (!user.res_id) {
                return res.json({
                    success: false,
                    message: 'Admin must be assigned to a restaurant'
                })
            }
            if (user.res_id.toString() !== id.toString()) {
                return res.json({
                    success: false,
                    message: 'You can only edit your own restaurant'
                })
            }
        }
        
        const restaurant = await restaurantService.editRestaurant(id, name, address, phone)
        
        if (!restaurant) {
            return res.json({
                success: false,
                message: 'Restaurant not found'
            })
        }
        
        res.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: restaurant
        })
    } catch (error) {
        return next(error)
    }
}

export {
    editRestaurant
}
