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
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400)
        }

        if (!validator.isEmail(email)) {
            throw new AppError('Please enter a valid email', 400)
        }

        const user = await userRepository.findByEmail(email)

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
