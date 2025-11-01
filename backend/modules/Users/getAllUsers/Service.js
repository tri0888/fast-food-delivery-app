import userRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class UserService {
    async getAllUsers() {
        return await userRepository.findAll()
    }
}

export default new UserService()
