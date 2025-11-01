import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class UserService {
    createToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET)
    }

    async register(name, email, password) {
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

        // Create user
        const newUser = await userRepository.create({name,
                                                     email,
                                                     password: hashedPassword})

        const token = this.createToken(newUser._id)

        return { token }
    }
}

export default new UserService()
