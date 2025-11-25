import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import bcrypt from 'bcrypt'

class UserService {
    async editUser(id, updateData) {
        const user = await userRepository.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        // Prepare update object
        const updates = {}

        if (updateData.name) {
            updates.name = updateData.name
        }

        if (updateData.password) {
            if (updateData.password.length < 8) {
                throw new AppError('Password must be at least 8 characters', 400)
            }
            const salt = await bcrypt.genSalt(10)
            updates.password = await bcrypt.hash(updateData.password, salt)
        }

        const validRoles = ['user', 'admin']
        if (updateData.role) {
            if (!validRoles.includes(updateData.role)) {
                throw new AppError('Invalid role', 400)
            }
            updates.role = updateData.role
        }

        // Update user
        const updatedUser = await userRepository.updateById(id, updates)

        // Remove password from response
        const userResponse = updatedUser.toObject()
        delete userResponse.password

        return userResponse
    }
}

export default new UserService()
