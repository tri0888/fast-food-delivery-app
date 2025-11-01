import orderService from './Service.js'

const updateStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.body
        
        await orderService.updateOrderStatus(orderId, status)
        
        res.json({success : true,
                  message : 'Status Updated'})

    } catch (error) {
        return next(error)
    }
}

export {updateStatus}
