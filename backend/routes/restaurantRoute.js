import express from 'express'
import { listRestaurants } from '../modules/Restaurants/listRestaurants/Controller.js'
import { addRestaurant, editRestaurant } from '../modules/Restaurants/addRestaurants/Controller.js'
import { getRestaurant } from '../modules/Restaurants/getRestaurant/Controller.js'
import { togglePermission } from '../modules/Restaurants/togglePermission/Controller.js'
import { deleteRestaurant } from '../modules/Restaurants/deleteRestaurant/Controller.js'
import { getPermissions } from '../modules/Restaurants/getPermissions/Controller.js'
import authMiddleware, { restrictTo, filterByRestaurant } from '../middleware/auth.js'

const restaurantRouter = express.Router()

// Public route for frontend users to view restaurants (no auth required)
restaurantRouter
    .route("/public/list")
    .get(listRestaurants)

restaurantRouter.use(authMiddleware)

restaurantRouter
    .route("/list")
    .get(restrictTo('admin', 'superadmin'), listRestaurants)

restaurantRouter
    .route("/add")
    .post(restrictTo('superadmin'), addRestaurant)

restaurantRouter
    .route("/toggle-permission")
    .patch(restrictTo('superadmin'), togglePermission)

restaurantRouter
    .route("/get")
    .get(restrictTo('admin', 'superadmin'), getRestaurant)

restaurantRouter
    .route("/edit")
    .patch(restrictTo('admin', 'superadmin'), filterByRestaurant, editRestaurant)

restaurantRouter
    .route("/permissions")
    .get(restrictTo('admin', 'superadmin'), getPermissions)

restaurantRouter
    .route('/delete/:restaurantId')
    .delete(restrictTo('superadmin'), deleteRestaurant)

export default restaurantRouter
