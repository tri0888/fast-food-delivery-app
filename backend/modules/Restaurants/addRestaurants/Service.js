import restaurantRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import validator from 'validator'
import bcrypt from 'bcrypt'

class RestaurantService {
    async addRestaurant(name, address, phone, adminEmail, adminPassword, location) {
        if (!name || !address || !phone) {
            throw new AppError('Restaurant information cannot be left blank', 400)
        }
        
        if (!adminEmail || !adminPassword) {
            throw new AppError('Admin email and password are required', 400)
        }

        if (!validator.isEmail(adminEmail)) {
            throw new AppError('Please enter a valid email', 400)
        }

        if (adminPassword.length < 8) {
            throw new AppError('Please enter a strong password (min 8 characters)', 400)
        }

        if (!location || typeof location.lat === 'undefined' || typeof location.lng === 'undefined') {
            throw new AppError('Restaurant location must be confirmed on the map', 400)
        }

        const lat = Number(location.lat)
        const lng = Number(location.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new AppError('Invalid restaurant coordinates provided', 400)
        }

        const existingUser = await restaurantRepository.findUser(adminEmail)
        if (existingUser) {
            throw new AppError('User already exists', 400)
        }

        // Create restaurant first
        const restaurant = await restaurantRepository.createRestaurant({
            name,
            address,
            phone,
            location: {
                lat,
                lng,
                label: location.label || address
            }
        })
        
        // Create admin user for this restaurant
        const salt           = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(adminPassword, salt)

        await restaurantRepository.createUser({name: `Admin ${name}`,
                                               email: adminEmail,
                                               password: hashedPassword,
                                               role: 'admin',
                                               res_id: restaurant._id})
        
        return restaurant
    }

    async editRestaurant(id, name, address, phone, location) {
        if (!id) {
            throw new AppError('Restaurant ID is required', 400)
        }
        if (!name || !address || !phone) {
            throw new AppError('Restaurant information cannot be left blank', 400)
        }
        
        const updateData = { name, address, phone }

        if (location && typeof location.lat !== 'undefined' && typeof location.lng !== 'undefined') {
            const lat = Number(location.lat)
            const lng = Number(location.lng)

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                throw new AppError('Invalid restaurant coordinates provided', 400)
            }

            updateData.location = {
                lat,
                lng,
                label: location.label || address
            }
        }
        return await restaurantRepository.updateRestaurant(id, updateData)
    }
}

export default new RestaurantService()

