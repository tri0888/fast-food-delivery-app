import userService from './Service.js'

const getAllUsers = async (req, res, next) => {
    try {
        // Pass restaurant filter from middleware or query (superadmin only)
        const filter = req.restaurantFilter || {};
        const queryRestaurantId = req.user?.role === 'superadmin' ? (req.query?.restaurantId || null) : null;
        const restaurantId = filter.res_id || queryRestaurantId || null;
        const users = await userService.getAllUsers(filter, restaurantId, req.user)
        
        res.json({success : true,
                  data    : users})

    } catch (error) {
        return next(error)
    }
}

export {getAllUsers}
