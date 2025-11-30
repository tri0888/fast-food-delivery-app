import restaurantService from './Service.js'

const getPermissions = async (req, res, next) => {
    try {
        const permissions = await restaurantService.getPermissions(req.user)
        
        res.json({
            success: true,
            data: permissions
        })
    } catch (error) {
        return next(error)
    }
}

export { getPermissions }
