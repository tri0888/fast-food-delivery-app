import express from 'express'
import {addFood} from '../modules/Foods/addFood/Controller.js'
import {listFood} from '../modules/Foods/listFood/Controller.js'
import {editFood} from '../modules/Foods/editFood/Controller.js'
import {removeFood} from '../modules/Foods/removeFood/Controller.js'
import multer from 'multer'
import authMiddleware, { restrictTo, filterByRestaurant, checkPermission } from '../middleware/auth.js'

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({destination : "uploads",
                                    filename    : (req, file, cb) => {
                                        return cb(null,`${Date.now()}${file.originalname}`)}
                                    })

const upload = multer({storage:storage})

// Public route for frontend users to view food list
foodRouter
    .route('/list')
    .get(listFood)

// Admin route for managing food list with permissions
foodRouter
    .route('/admin/list')
    .get(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('food', 'list_food'), listFood)
foodRouter
    .route('/add')
    .post(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('food', 'add_food'), upload.single('image'), addFood)
foodRouter
    .route('/remove')
    .post(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('food', 'remove_food'), removeFood)
foodRouter
    .route('/edit')
    .patch(authMiddleware, restrictTo('admin', 'superadmin'), filterByRestaurant, checkPermission('food', 'edit_food'), upload.single('image'), editFood)

export default foodRouter;