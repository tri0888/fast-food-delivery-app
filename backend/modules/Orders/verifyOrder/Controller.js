import orderService from './Service.js'

const verifyOrder = async (req, res, next) => {
    try {
        const { orderId, success } = req.body
        
        const result = await orderService.verifyOrder(orderId, success)
        
        res.json({success : result.success,
                  message : result.message})

    } catch (error) {
        return next(error)
    }
}

export {verifyOrder}
