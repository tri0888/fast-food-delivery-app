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
        req.auth = { id: token_decode.id, role: user.role, restaurantId: user.res_id };
        next();
    } catch (error) {
        res.json({success : false, 
                  message : error})
    }
}

export const restrictTo = (...roles) => {
    return (req, res, next) => {
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

// Multi-tenant middleware: Filter data by restaurant
export const filterByRestaurant = async (req, res, next) => {
    try {
        // SuperAdmin can see all data
        if (req.user.role === 'superadmin') {
            return next();
        }
        
        // Admin must have res_id and can only see their restaurant data
        if (req.user.role === 'admin') {
            if (!req.user.res_id) {
                return res.json({
                    success: false,
                    message: 'Admin must be assigned to a restaurant'
                });
            }
            // Add restaurant filter to query
            req.restaurantFilter = { res_id: req.user.res_id };
            req.body.res_id = req.user.res_id; // Auto-assign for create operations
        }
        
        // Users don't need restaurant filtering (they see all available food)
        next();
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Check if restaurant permission is enabled
// Usage: checkPermission('food', 'addfood')
export const checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            // SuperAdmin can access everything
            if (req.user.role === 'superadmin') {
                return next();
            }
            
            // Check if admin's restaurant has this permission enabled
            if (req.user.role === 'admin' && req.user.res_id) {
                const Restaurant = (await import('../models/restaurantModel.js')).default;
                const restaurant = await Restaurant.findById(req.user.res_id);
                
                if (!restaurant) {
                    return res.json({
                        success: false,
                        message: 'Restaurant not found'
                    });
                }
                
                if (!restaurant.permissions[module] || !restaurant.permissions[module][action]) {
                    return res.json({
                        success: false,
                        message: `Permission "${module}.${action}" is disabled for your restaurant`
                    });
                }
            }
            
            next();
        } catch (error) {
            res.json({success: false, message: error.message});
        }
    };
};

export default authMiddleware;