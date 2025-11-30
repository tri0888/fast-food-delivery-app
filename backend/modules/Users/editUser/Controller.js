import userService from './Service.js'

const editUser = async (req, res, next) => {
    try {
        const { id, name, password, role } = req.body
        
        const user = await userService.editUser(id, { name, password, role })
        
        res.json({success : true,
                  message : 'User updated successfully',
                  data    : user})

    } catch (error) {
        return next(error)
    }
}

export {editUser}
