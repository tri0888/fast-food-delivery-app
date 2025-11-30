import express from 'express'
import authMiddleware, { filterByRestaurant, restrictTo } from '../middleware/auth.js'
import { listDrones } from '../modules/Drones/listDrones/Controller.js'
import { addDrone } from '../modules/Drones/addDrone/Controller.js'

const droneRouter = express.Router()

droneRouter.use(authMiddleware)

droneRouter
    .route('/list')
    .get(restrictTo('admin', 'superadmin'), filterByRestaurant, listDrones)

droneRouter
    .route('/add')
    .post(restrictTo('superadmin'), addDrone)

export default droneRouter
