import userService from './Service.js'

const toggleCartLock = async (req, res, next) => {
    try {
        const { userId } = req.body        
        const user       = await userService.toggleCartLock(userId)
        
        res.json({success      : true,
                  message      : 'Cart lock status updated',
                  data: {userId     : user._id, 
                         isCartLock : user.isCartLock}})

    } catch (error) {
        return next(error)
    }
}

export {toggleCartLock}
