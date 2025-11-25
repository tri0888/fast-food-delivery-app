import userService from './Service.js'

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        
        const result = await userService.login(email, password)
        
          res.json({success      : true,
                token        : result.token,
                role         : result.role,
                name         : result.name,
                restaurantId : result.restaurantId})

    } catch (error) {
        return next(error)
    }
}

export {loginUser}
