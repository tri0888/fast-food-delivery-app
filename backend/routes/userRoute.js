import express from 'express'
import { loginUser, registerUser, getAllUsers, toggleCartLock} from '../controllers/userController.js'

const userRouter = express.Router();

userRouter
    .route("/register")
    .post(registerUser)
userRouter
    .route("/login")
    .post(loginUser)//k sửa đc
userRouter
    .route("/list")
    .get(getAllUsers)
userRouter
    .route("/toggle-cart-lock")
    .post(toggleCartLock)//k sửa đc

export default userRouter;
