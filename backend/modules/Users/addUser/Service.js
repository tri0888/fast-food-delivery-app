import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import validator from 'validator'
import bcrypt from 'bcrypt'

class UserService {
    async addUser(name, email, password, role) {
        // Validation
        if (!name || !email || !password) {
            throw new AppError('Please provide all required fields', 400)
        }

        if (!validator.isEmail(email)) {
            throw new AppError('Please enter a valid email', 400)
        }

        if (password.length < 8) {
            throw new AppError('Please enter a strong password (min 8 characters)', 400)
        }

        // Check if user already exists
        const exists = await userRepository.findByEmail(email)

        if (exists) {
            throw new AppError('User already exists', 400)
        }

        // Hash password
        const salt           = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user with role
        const newUser = await userRepository.create({name,
                                                     email,
                                                     password: hashedPassword,
                                                     role: role || 'user'})

        // Remove password from response
        const userResponse = newUser.toObject()
        delete userResponse.password

        return userResponse
    }
}

export default new UserService()
