import fs from 'fs'
import foodModel from '../models/foodModel.js'

//add food item
const addFood = async (req,res) => {

    let image_filename = `${req.file.filename}`;

    const food = new foodModel({name        : req.body.name,
                                description : req.body.description,
                                price       : req.body.price,
                                category    : req.body.category,
                                image       : image_filename,
                                stock       : req.body.stock,})

    try {
        await food.save();
        res.json({success : true,
                  message : 'Food Added'})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

// All food list
const listFood = async (req,res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success : true,
                  data    : foods})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

// remove food item
const removeFood = async (req,res)=>{
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({success : true,
                  message : 'Food Removed'})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
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
        // Cập nhật updatedAt
        updateData.updatedAt = Date.now();
        const food = await foodModel.findByIdAndUpdate(id      = foodId, 
                                                       update  = updateData, 
                                                       options = { new: true });
        res.json({success : true, 
                  message : 'Food updated', 
                  data    : food});
    } catch (error) {
        console.log(error);
        res.json({success : false, 
                  message : error});
    }
}

export {addFood, 
        listFood, 
        removeFood, 
        editFood}