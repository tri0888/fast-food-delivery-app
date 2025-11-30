import orderService from './Service.js'

const updateStatus = async (req, res, next) => {
    try {
        const { orderId, status, droneId } = req.body
        
        await orderService.updateOrderStatus(orderId, status, { droneId })
        
        res.json({success : true,
                  message : 'Status Updated'})

    } catch (error) {
        return next(error)
    }
}

export {updateStatus}
