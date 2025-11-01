import cartService from './Service.js'

const addToCart = async (req, res, next) => {
    try {
        const userId = req.body.userId
        const foodId = req.body.itemId
        
        await cartService.createCart(userId, foodId)
        res.json({success : true,
                  message : 'Added to cart'})

    } catch (error) {
        return next(error)
    }
}

export {addToCart}