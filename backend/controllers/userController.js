import userModel from "../models/userModel.js";

import AppError from "../utils/appError.js";

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

//login user
const loginUser = async (req,res,next) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return res.json({success : false, 
                             message : 'Login information cannot be left blank'})
        }

        if (!validator.isEmail(email)) {
            return res.json({success : false, 
                             message : 'Please enter a valid email'})
        }

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success : false, 
                             message : 'User does not exist'}) 
        }

        const isMatch = await bcrypt.compare(password,
                                             user.password)

        if(!isMatch){
            return res.json({success : false, 
                             message : 'Invalid credentials'})
        }

        const token = createToken(user._id);
        const role  = user.role;
        res.json({success : true, 
                  token,
                  role})
    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, { password: 0 }); // Exclude password field
        res.json({success : true, 
                  data    : users });
    } catch (error) {
        return next(new AppError('Error fetching users', 404))
    }
}

const createToken = (id) =>{
    return jwt.sign({id},
                    process.env.JWT_SECRET)
}

//register user
const registerUser = async (req, res) => {
    const {name, 
           password, 
           email} = req.body;
    try {
        // checking is user already exists
        const exists = await userModel.findOne({email});
        if (!name || !email || !password) {
            return res.json({success : false, 
                             message : 'Registration information cannot be left blank'})
        }

        if (exists) {
            return res.json({success : false, 
                             message : 'User already exists'})
        }

        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({success : false, 
                             message : 'Please enter a valid email'})
        }

        if (password.length<8) {
            return res.json({success : false, 
                             message : 'Please enter a password have at least 8 characters'})
        }

        // hashing user password
        const salt           = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({name     : name,
                                       email    : email,
                                       password : hashedPassword})

        const user  =  await newUser.save()
        const token = createToken(user._id)
        res.json({success : true, 
                  token})

    } catch (error) {
        return next(new AppError(error.message, 404))
    }
}

const toggleCartLock = async (req, res, next) => {
    try {
        // Lấy user
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user) {
            // Đảo trạng thái isCartLock
            user.isCartLock = !user.isCartLock;
            await user.save();
            res.json({success: true, 
                      data: {userId     : user._id, 
                             isCartLock : user.isCartLock}});
        }
        else
            return res.json({success : false, 
                             message : "User not found" });
    } catch (error) {
        return next(new AppError("Error toggling cart lock", 500))
    }
};

const addUser = async (req, res, next) => {
    const {name, 
           password, 
           email,
           role} = req.body;
    try {
        // checking is user already exists
        const exists = await userModel.findOne({email});
        if (!name || !email || !password) {
            return res.json({success : false, 
                             message : 'All fields are required'})
        }

        if (exists) {
            return res.json({success : false, 
                             message : 'User already exists'})
        }

        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({success : false, 
                             message : 'Please enter a valid email'})
        }

        if (password.length<8) {
            return res.json({success : false, 
                             message : 'Please enter a password have at least 8 characters'})
        }

        // hashing user password
        const salt           = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({name     : name,
                                       email    : email,
                                       password : hashedPassword,
                                       role     : role});

        await newUser.save();
        res.json({
            success: true,
            message: 'User added successfully'
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Edit user (admin only)
const editUser = async (req, res, next) => {
    const { id, name, email, password, role, isCartLock } = req.body;
    try {
        const user = await userModel.findById(id);        
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it already exists
        if (email !== user.email) {
            const emailExists = await userModel.findOne({ email });
            if (emailExists) {
                return res.json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: 'Please enter a valid email'
            });
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.role = role || user.role;
        user.isCartLock = isCartLock !== undefined ? isCartLock : user.isCartLock;

        // Update password only if provided
        if (password && password.trim()) {
            if (password.length < 8) {
                return res.json({
                    success: false,
                    message: 'Password must be at least 8 characters'
                });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {loginUser, 
        registerUser, 
        getAllUsers, 
        toggleCartLock,
        addUser,
        editUser}
