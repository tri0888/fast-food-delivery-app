import express from 'express'
import { loginUser, registerUser, getAllUsers, toggleCartLock} from '../controllers/userController.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/list', getAllUsers)
userRouter.post('/toggle-cart-lock', toggleCartLock)

export default userRouter;
