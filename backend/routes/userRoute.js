import express from 'express'
import { loginUser, registerUser, getAllUsers} from '../controllers/userController.js'
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

export default userRouter;
