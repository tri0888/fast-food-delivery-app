import express from 'express'
import {addFood, 
        listFood,
        removeFood, 
        editFood} from '../controllers/foodController.js'
import multer from 'multer'
import authMiddleware, { restrictTo } from '../middleware/auth.js'

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({destination : "uploads",
                                    filename    : (req, file, cb) => {
                                        return cb(null,`${Date.now()}${file.originalname}`)}
                                    })

const upload = multer({storage:storage})
foodRouter
    .route('/list')
    .get(listFood)
foodRouter
    .route('/add')
    .post(authMiddleware, restrictTo('admin'), upload.single('image'), addFood)
foodRouter
    .route('/remove')
    .post(authMiddleware, restrictTo('admin'), removeFood)
foodRouter
    .route('/edit')
    .patch(authMiddleware, restrictTo('admin'), upload.single('image'), editFood)

export default foodRouter;