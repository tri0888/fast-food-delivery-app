import userService from './Service.js'

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        
        const result = await userService.login(email, password)
        
        res.json({success : true,
                  message : 'Login success',
                  token   : result.token,
                  role    : result.role})

    } catch (error) {
        return next(error)
    }
}

export {loginUser}
