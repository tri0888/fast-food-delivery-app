import express from 'express'
import { loginUser, registerUser, getAllUsers, toggleCartLock} from '../controllers/userController.js'
import authMiddleware, { restrictTo } from '../middleware/auth.js'

const userRouter = express.Router();

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

export default userRouter;
