import express from "express"
import authMiddleware, { restrictTo, filterByRestaurant, checkPermission } from '../middleware/auth.js'
import { placeOrder } from '../modules/Orders/placeOrder/Controller.js'
import { verifyOrder } from '../modules/Orders/verifyOrder/Controller.js'
import { userOrders } from '../modules/Orders/userOrders/Controller.js'
import { listOrders } from '../modules/Orders/listOrders/Controller.js'
import { updateStatus } from '../modules/Orders/updateStatus/Controller.js'
import { confirmDelivery } from '../modules/Orders/confirmDelivery/Controller.js'

const orderRouter = express.Router()

orderRouter
    .route("/place")
    .post(authMiddleware, placeOrder)
orderRouter
    .route("/verify")
    .post(verifyOrder)
orderRouter
    .route("/confirm-delivery")
    .patch(authMiddleware, confirmDelivery)
orderRouter
    .route("/userorders")
    .post(authMiddleware, userOrders)
orderRouter
    .route("/list")
    .get(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('orders', 'list'), listOrders)
orderRouter
    .route("/status")
    .patch(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('orders', 'update_status'), updateStatus)

export default orderRouter

