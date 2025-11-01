import express from 'express'
import {addToCart} from '../modules/Carts/addToCart/Controller.js'
import {removeFromCart} from '../modules/Carts/removeFromCart/Controller.js'
import {getCart} from '../modules/Carts/getCart/Controller.js'
import authMiddleware from '../middleware/auth.js'

const cartRouter = express.Router()

cartRouter
    .route("/add")
    .post(authMiddleware, addToCart)
cartRouter
    .route("/remove")
    .post(authMiddleware, removeFromCart)
cartRouter
    .route("/get")
    .get(authMiddleware, getCart)

export default cartRouter
