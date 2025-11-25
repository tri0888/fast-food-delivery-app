import userService from './Service.js'

const toggleCartLock = async (req, res, next) => {
    try {
        const { userId, restaurantId: bodyRestaurantId } = req.body
        const contextRestaurantId = bodyRestaurantId || req.body.res_id || req.user?.res_id

        const result = await userService.toggleCartLock(userId, contextRestaurantId)
        
        res.json({success      : true,
                  message      : 'Cart lock status updated',
                  data         : result})

    } catch (error) {
        return next(error)
    }
}

export {toggleCartLock}
