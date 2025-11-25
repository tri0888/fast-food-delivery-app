import orderService from './Service.js'
import AppError from '../../../utils/appError.js'

const placeOrder = async (req, res, next) => {
    try {
        const { userId, items, amount, address } = req.body

        if (!userId) {
            return next(new AppError('Missing userId', 400))
        }

        if (!Array.isArray(items) || items.length === 0) {
            return next(new AppError('Order items must be a non-empty array', 400))
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        
        const result = await orderService.placeOrder(userId, items, amount, address, frontendUrl)
        
        res.json({success     : true,
                  session_url : result.session_url})

    } catch (error) {
        return next(error)
    }
}

export {placeOrder}
