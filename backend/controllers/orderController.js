// import orderModel from './../models/orderModel.js';
// import userModel from './../models/userModel.js';
// // import foodService from './../modules/Foods/services/foodService.js';
// import dotenv from 'dotenv';
// import Stripe from "stripe"

// import AppError from '../utils/appError.js';

// dotenv.config();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Placing user order for frontend
// const placeOrder = async (req, res, next) =>{

//     const frontend_url = 'http://localhost:5173';
//     try {
//         // Prepare items for stock reservation
//         const stockItems = req.body.items.map(item => ({foodId   : item._id,
//                                                         quantity : item.quantity,
//                                                         name     : item.name}));

//         // Reserve stock using foodService (it will check and reserve in one transaction)
//         await foodService.reserveStock(stockItems);

//         const newOrder = new orderModel({userId  : req.body.userId,
//                                          items   : req.body.items,
//                                          amount  : req.body.amount,
//                                          address : req.body.address})

//         await newOrder.save();
//         await userModel.findByIdAndUpdate(req.body.userId,
//                                           {cartData:{}});//k sửa đc
        
//         const line_items = req.body.items.map((item)=>({
//             price_data : {
//                 currency     : "lkr",
//                 product_data : {name : item.name},
//                 unit_amount  : item.price*100*300
//             },
//             quantity : item.quantity
//         }))

//         line_items.push({
//             price_data : {
//                 currency     : "lkr",
//                 product_data : {name : "Delivery Charges"},
//                 unit_amount  : 2*100*80
//             },
//             quantity : 1
//         })

//         const session = await stripe.checkout.sessions.create({
//             line_items   : line_items,
//             mode         : 'payment',
//             success_url  : `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url   : `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
//         })

//         res.json({success     : true, 
//                   session_url : session.url})
//     } catch (error) {
//         return next(new AppError(error.message, 404))
//     }
// }

// const verifyOrder = async (req, res, next) =>{
//     const {orderId, success} = req.body;
//     try {
//         if (success=='true') {
//             // Get order details
//             const order = await orderModel.findById(orderId);
//             if (!order) {
//                 return res.json({success : false, 
//                                  message : "Order not found"});
//             }

//             // Mark order as paid (stock already deducted in placeOrder)
//             await orderModel.findByIdAndUpdate(orderId, {payment : true});
//             res.json({success : true, 
//                       message : "Payment verified successfully"})
//         }
//         else {
//             // Payment failed - restore stock and delete order
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 // Prepare items for stock release
//                 const stockItems = order.items.map(item => ({
//                     foodId: item._id,
//                     quantity: item.quantity,
//                     name: item.name
//                 }));
                
//                 // Restore stock using foodService
//                 await foodService.releaseStock(stockItems);
//                 console.log(`Restored stock for order ${orderId}`);
//             }
//             await orderModel.findByIdAndDelete(orderId);
//             res.json({success : false, 
//                       message :"Payment failed - stock restored"})
//             // return next(new AppError("Payment failed - stock restored", 404))
//         }
//     } catch (error) {
//         return next(new AppError(error.message, 404))
//     }
// }

// // user orders for frontend
// const userOrders = async (req,res) => {
//     try {
//         const orders = await orderModel.find({userId : req.body.userId})
//         res.json({success : true, 
//                   data    : orders})
//     } catch (error) {
//         return next(new AppError(error.message, 404))
//     }
// }

// // listing orders for admin panel
// const listOrders = async (req,res) =>{
//    try {
//     const orders = await orderModel.find({});
//     res.json({success : true, 
//               data    : orders})
//    } catch (error) {
//         return next(new AppError(error.message, 404))
//    } 
// }

// // api for updating order status
// const updateStatus = async (req, res) =>{
//     try {
//         await orderModel.findByIdAndUpdate(req.body.orderId,
//                                            {status : req.body.status})//k sửa đc
//         res.json({success : true, 
//                   message : "Status Updated"})
//     } catch (error) {
//         return next(new AppError(error.message, 404))
//     }
// }

// export {placeOrder, 
//         verifyOrder, 
//         userOrders,
//         listOrders, 
//         updateStatus}