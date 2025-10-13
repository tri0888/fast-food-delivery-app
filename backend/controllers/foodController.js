import fs from 'fs'
import foodModel from '../models/foodModel.js'
import AppError from '../utils/appError.js';

//add food item
const addFood = async (req,res) => {    

    if (!req.file) {
        return res.json({success: false, message: 'Image is required'});
    }

    let image_filename = `${req.file.filename}`;

    const food = new foodModel({name        : req.body.name,
                                description : req.body.description,
                                price       : req.body.price,
                                category    : req.body.category,
                                image       : image_filename,
                                isAvailable : req.body.isAvailable !== undefined ? req.body.isAvailable : true,
                                stock       : req.body.stock,})

    try {
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.category || !req.body.stock) {
            return res.json({success : false, 
                             message : 'Food information cannot be left blank'});
        }

        await food.save();
        res.json({success : true,
                  message : 'Food Added'})
    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

// All food list
const listFood = async (req,res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success : true,
                  data    : foods})
    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

// remove food item
const removeFood = async (req,res)=>{
    try {
        const food = await foodModel.findById(req.body.id);
        if (food != null){
            fs.unlink(`uploads/${food.image}`,()=>{})
    
            await foodModel.findByIdAndDelete(req.body.id)
            res.json({success : true,
                      message : 'Food Removed'})
        }
        else 
            res.status(404).json({success : false,
                                  message : 'Food not found'})
    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

// Edit food item
const editFood = async (req, res) => {
    try {
        const foodId     = req.body.id;
        const updateData = { ...req.body };
        // Nếu có upload ảnh mới
        if (req.file && req.file.filename) {
            updateData.image = req.file.filename;
        }
        // Không cho sửa id
        delete updateData.id;

        if (!updateData.name || !updateData.description || !updateData.price || !updateData.category || !updateData.stock) {
            return res.json({success : false, 
                             message : 'Food information cannot be left blank'});
        }

        // Cập nhật updatedAt
        updateData.updatedAt = Date.now();
        const food = await foodModel.findByIdAndUpdate(foodId, 
                                                       updateData, 
                                                       { new: true });//k sửa đc
        if (food != null){
            res.json({success : true, 
                      message : 'Food updated', 
                      data    : food});    
        }
        else 
            res.status(404).json({success : false, 
                                  message : 'Food not found'});
    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

export {addFood, 
        listFood, 
        removeFood, 
        editFood}