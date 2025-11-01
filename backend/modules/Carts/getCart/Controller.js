import cartService from './Service.js'

const getCart = async (req, res, next) => {
    try {
        const userId = req.body.userId
        
        const result = await cartService.getCart(userId)
        res.json({success      : true,
                  cartData     : result.cartData,
                  isCartLocked : result.isCartLocked})

    } catch (error) {
        return next(error)
    }
}

export {getCart}