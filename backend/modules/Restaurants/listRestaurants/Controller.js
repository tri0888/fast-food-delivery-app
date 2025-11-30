import restaurantService from './Service.js'

const listRestaurants = async (req, res, next) => {
    try {
        // If authenticated and admin, filter by their restaurant
        // Otherwise (public access or superadmin), show all
        const filter = req.user && req.user.role === 'admin' ? { _id: req.user.res_id } : {}
        const restaurants = await restaurantService.listRestaurants(filter)
        
        res.json({
            success: true,
            data: restaurants
        })
    } catch (error) {
        return next(error)
    }
}

// const togglePermission = async (req, res, next) => {
//     try {
//         const { id } = req.params
//         const { module, action, enabled } = req.body
        
//         if (!module || !action) {
//             return next(new AppError('Module and action are required', 400))
//         }
        
//         const validModules = ['food', 'orders', 'users']
//         if (!validModules.includes(module)) {
//             return next(new AppError('Invalid module name', 400))
//         }
        
//         const restaurant = await restaurantService.togglePermission(id, module, action, enabled)
        
//         if (!restaurant) {
//             return next(new AppError('Restaurant not found', 404))
//         }
        
//         res.json({
//             success: true,
//             message: `Permission ${module}.${action} ${enabled ? 'enabled' : 'disabled'} successfully`,
//             data: restaurant
//         })
//     } catch (error) {
//         return next(error)
//     }
// }

export {
    listRestaurants
    // togglePermission
}
