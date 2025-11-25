import mongoose from 'mongoose'
import userRepository from './Repository.js'
import orderModel from '../../../models/orderModel.js'

class UserService {
    async getAllUsers(filter = {}, restaurantId = null, currentUser = null) {
        if (restaurantId) {
            const userIds = await orderModel.distinct('userId', { res_id: restaurantId });
            if (!userIds.length) {
                return await this.appendAdminIfNeeded([], currentUser);
            }

            const objectIds = userIds.reduce((acc, id) => {
                if (!id) {
                    return acc;
                }

                if (id instanceof mongoose.Types.ObjectId) {
                    acc.push(id);
                    return acc;
                }

                try {
                    acc.push(new mongoose.Types.ObjectId(id));
                } catch (err) {
                    // Ignore malformed ids that may be present from legacy data
                }
                return acc;
            }, []);

            if (!objectIds.length) {
                return [];
            }

            const users = await userRepository.findAll({ _id: { $in: objectIds } });
            return await this.appendAdminIfNeeded(users, currentUser);
        }

        return await userRepository.findAll(filter)
    }

    async appendAdminIfNeeded(users, currentUser) {
        if (!currentUser || currentUser.role !== 'admin') {
            return users;
        }

        const alreadyIncluded = users.some((user) => user._id.toString() === currentUser._id.toString());
        if (alreadyIncluded) {
            return users;
        }

        const adminUser = await userRepository.findById(currentUser._id);
        if (!adminUser) {
            return users;
        }

        return [adminUser, ...users];
    }
}

export default new UserService()
