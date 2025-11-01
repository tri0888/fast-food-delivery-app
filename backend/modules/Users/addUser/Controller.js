import userService from './Service.js'

const addUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body
        
        const user = await userService.addUser(name, email, password, role)
        
        res.json({success : true,
                  message : 'User created successfully',
                  data    : user})

    } catch (error) {
        return next(error)
    }
}

export {addUser}
