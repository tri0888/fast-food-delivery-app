import orderService from './Service.js'

const userOrders = async (req, res, next) => {
    try {
        const userId = req.body.userId        
        const orders = await orderService.getUserOrders(userId)
        
        res.json({success : true,
                  data    : orders})

    } catch (error) {
        return next(error)
    }
}

export {userOrders}
