import userService from './Service.js'

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers()
        
        res.json({success : true,
                  data    : users})

    } catch (error) {
        return next(error)
    }
}

export {getAllUsers}
