import cartService from './Service.js'

const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.body.userId
        const foodId = req.body.itemId
        const removeCompletely = req.body.removeCompletely || false
        
        await cartService.removeFromCart(userId, foodId, removeCompletely)
        res.json({success : true,
                  message : 'Removed from cart'})

    } catch (error) {
        return next(error)
    }
}

export {removeFromCart}