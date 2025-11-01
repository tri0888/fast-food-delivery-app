import express from 'express'
import { loginUser } from '../modules/Users/login/Controller.js'
import { registerUser } from '../modules/Users/register/Controller.js'
import { getAllUsers } from '../modules/Users/getAllUsers/Controller.js'
import { toggleCartLock } from '../modules/Users/toggleCartLock/Controller.js'
import { addUser } from '../modules/Users/addUser/Controller.js'
import { editUser } from '../modules/Users/editUser/Controller.js'
import authMiddleware, { restrictTo } from '../middleware/auth.js'

const userRouter = express.Router()

userRouter
    .route("/register")
    .post(registerUser)
userRouter
    .route("/login")
    .post(loginUser)
userRouter
    .route("/list")
    .get(authMiddleware, restrictTo('admin'), getAllUsers)
userRouter
    .route("/toggle-cart-lock")
    .patch(authMiddleware, restrictTo('admin'), toggleCartLock)
userRouter
    .route("/add")
    .post(authMiddleware, restrictTo('admin'), addUser)
userRouter
    .route("/edit")
    .patch(authMiddleware, restrictTo('admin'), editUser)

export default userRouter
