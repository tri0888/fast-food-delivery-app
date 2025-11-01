import userService from './Service.js'

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        
        const result = await userService.register(name, email, password)
        
        res.json({success : true,
                  token   : result.token})

    } catch (error) {
        return next(error)
    }
}

export {registerUser}
