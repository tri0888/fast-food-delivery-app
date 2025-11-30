import orderService from './Service.js'

const listOrders = async (req, res, next) => {
    try {
        // Pass restaurant filter from middleware
        const filter = req.restaurantFilter || {};
        const orders = await orderService.getAllOrders(filter)
        
        res.json({success : true,
                  data    : orders})

    } catch (error) {
        return next(error)
    }
}

export {listOrders}
