import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const authMiddleware = async (req, res, next) => {
    const {token} = req.headers;
    if(!token){
        return res.json({success : false, 
                         message : 'Not Authorized, login again'})
    }

    try {
        const token_decode = jwt.verify(token, 
                                        process.env.JWT_SECRET);        
        const user = await userModel.findById(token_decode.id);        
        if (!user) {
            return res.json({success: false, message: 'User not found'});
        }        
        req.user = user;
        req.userId = token_decode.id;
        if (!req.body.userId) {
            req.body.userId = token_decode.id;
        }
        req.auth = { id: token_decode.id, role: user.role };
        next();
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles = ['admin', 'staff']
        if (!req.user) {
            return res.json({success: false, message: 'User not authenticated'});
        }
        
        if (!roles.includes(req.user.role)) {
            return res.json({
                success: false, 
                message: 'You do not have permission to perform this action'
            });
        }
        
        next();
    };
};

export default authMiddleware;