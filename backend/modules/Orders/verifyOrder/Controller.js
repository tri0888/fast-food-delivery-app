import orderService from './Service.js'

const verifyOrder = async (req, res, next) => {
    try {
        const { orderId, orderIds, success, sessionId } = req.body

        let normalizedIds = []
        if (Array.isArray(orderIds)) {
            normalizedIds = orderIds
        } else if (typeof orderIds === 'string') {
            normalizedIds = orderIds.split(',')
        } else if (typeof orderId === 'string') {
            normalizedIds = orderId.split(',')
        }

        normalizedIds = normalizedIds.map((id) => id.trim()).filter(Boolean)
        
        const result = await orderService.verifyOrder({
            orderIds: normalizedIds,
            success,
            sessionId
        })
        
        res.json({success : result.success,
                  message : result.message})

    } catch (error) {
        return next(error)
    }
}

export {verifyOrder}
