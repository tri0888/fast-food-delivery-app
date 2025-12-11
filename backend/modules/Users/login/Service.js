import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class UserService {
    createToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET)
    }

    async login(email, password) {
        if (typeof email !== 'string' || typeof password !== 'string') {
            throw new AppError('Please provide email and password', 400)
        }

        const normalizedEmail = email.trim()

        if (!normalizedEmail || !password.trim()) {
            throw new AppError('Please provide email and password', 400)
        }

        if (!validator.isEmail(normalizedEmail)) {
            throw new AppError('Please enter a valid email', 400)
        }

        const user = await userRepository.findByEmail(normalizedEmail)

        if (!user) {
            throw new AppError('Incorrect Email', 401)
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new AppError('Incorrect Password', 401)
        }

        const token = this.createToken(user._id)
        const role = user.role

        return { token, role }
    }
}

export default new UserService()
