import restaurantService from './Service.js'

const getRestaurant = async (req, res, next) => {
    try {
        const { id } = req.query
        const restaurant = await restaurantService.getRestaurant(id)
        
        if (!restaurant) {
            return res.json({ success: false, message: 'Restaurant not found' })
        }
        
        res.json({ success: true, data: restaurant })
    } catch (error) {
        return next(error)
    }
}

export {
    getRestaurant
}
