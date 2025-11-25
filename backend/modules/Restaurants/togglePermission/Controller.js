import restaurantService from './Service.js'

const togglePermission = async (req, res, next) => {
    try {
        const { restaurantId, module, action, value } = req.body

        const restaurant = await restaurantService.togglePermission(restaurantId, module, action, value)
        
        res.json({
            success: true,
            message: `Permission ${module}.${action} ${value ? 'enabled' : 'disabled'} successfully`,
            data: restaurant
        })
    } catch (error) {
        return next(error)
    }
}

export {
    togglePermission
}
