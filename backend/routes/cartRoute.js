import express from 'express'
import {addToCart, 
        removeFromCart, 
        getCart} from '../controllers/cartController.js'
import authMiddleware from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter
    .route("/add")
    .post(authMiddleware, addToCart)
cartRouter
    .route("/remove")
    .post(authMiddleware, removeFromCart)
cartRouter
    .route("/get")
    .post(authMiddleware, getCart)//k sửa đc

export default cartRouter;
