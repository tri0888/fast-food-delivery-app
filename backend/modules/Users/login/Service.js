import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class UserService {
    createToken(id, role, name, restaurantId) {
        const payload = { id, role, name }

        if (restaurantId) {
            payload.restaurantId = restaurantId
        }

        return jwt.sign(payload, process.env.JWT_SECRET)
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

        const restaurantId = user.res_id ? user.res_id.toString() : undefined
        const token = this.createToken(user._id, user.role, user.name, restaurantId)

        return { token, role: user.role, name: user.name, restaurantId }
    }
}

export default new UserService()
