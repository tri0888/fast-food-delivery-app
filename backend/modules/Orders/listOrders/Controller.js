import orderService from './Service.js'

const listOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders()
        
        res.json({success : true,
                  data    : orders})

    } catch (error) {
        return next(error)
    }
}

export {listOrders}
