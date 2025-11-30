import restaurantService from './Service.js'

const addRestaurant = async (req, res, next) => {
    try {
        const { name, address, phone, adminEmail, adminPassword, location } = req.body
        
        const restaurant = await restaurantService.addRestaurant(name, address, phone, adminEmail, adminPassword, location)
        
        res.json({
            success: true,
            message: 'Restaurant and admin account created successfully',
            data: restaurant
        })
    } catch (error) {
        return next(error)
    }
}

const editRestaurant = async (req, res, next) => {
    try {
        const { id, name, address, phone, location } = req.body
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
        
        const restaurant = await restaurantService.editRestaurant(id, name, address, phone, location)
        
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
    addRestaurant,
    editRestaurant
}
