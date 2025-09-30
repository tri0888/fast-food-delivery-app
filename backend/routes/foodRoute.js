import express from 'express'
import {addFood, 
        listFood,
        removeFood, 
        editFood} from '../controllers/foodController.js'
import multer from 'multer'

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({destination : "uploads",
                                    filename    : (req, file, cb) => {
                                        return cb(null,`${Date.now()}${file.originalname}`)}
                                    })

const upload = multer({storage:storage})
foodRouter
    .route('/add')
    .post(upload.single('image'), addFood)
foodRouter
    .route('/list')
    .get(listFood)
foodRouter
    .route('/remove')
    .post(removeFood)
foodRouter
    .route('/edit')
    .patch(upload.single('image'), editFood)

export default foodRouter;