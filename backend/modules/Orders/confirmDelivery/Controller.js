import confirmDeliveryService from './Service.js'

const confirmDelivery = async (req, res, next) => {
    try {
        const { orderId } = req.body
        const userId = req.userId

        const result = await confirmDeliveryService.confirm(orderId, userId)

        res.json({ success: result.success, message: 'Order marked as delivered' })
    } catch (error) {
        return next(error)
    }
}

export { confirmDelivery }
