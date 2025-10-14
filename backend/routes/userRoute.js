import express from 'express'
import { loginUser, registerUser, getAllUsers, toggleCartLock, addUser, editUser} from '../controllers/userController.js'
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
userRouter
    .route("/add")
    .post(authMiddleware, restrictTo('admin'), addUser)
userRouter
    .route("/edit")
    .patch(authMiddleware, restrictTo('admin'), editUser)

export default userRouter;
