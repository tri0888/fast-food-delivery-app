import orderService from './Service.js'

const placeOrder = async (req, res, next) => {
    try {
        const { userId, items, amount, address } = req.body
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        
        const result = await orderService.placeOrder(userId, items, amount, address, frontendUrl)
        
        res.json({success     : true,
                  session_url : result.session_url})

    } catch (error) {
        return next(error)
    }
}

export {placeOrder}
