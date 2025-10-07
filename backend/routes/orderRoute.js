import express from "express"
import authMiddleware, { restrictTo } from '../middleware/auth.js';
import {placeOrder, 
        verifyOrder, 
        userOrders,
        listOrders,
        updateStatus} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter
    .route("/place")
    .post(authMiddleware, placeOrder);
orderRouter
    .route("/verify")
    .post(verifyOrder)
orderRouter
    .route("/userorders")
    .post(authMiddleware, userOrders)
orderRouter
    .route("/list")
    .get(authMiddleware, restrictTo('admin'), listOrders)
orderRouter
    .route("/status")
    .patch(authMiddleware, restrictTo('admin'), updateStatus)

export default orderRouter;

