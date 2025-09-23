import orderModel from './../models/orderModel.js';
import userModel from './../models/userModel.js';
import foodModel from './../models/foodModel.js';
import Stripe from "stripe"

const stripe =  new Stripe(process.env.STRIPE_SECRET_KEY)

// Placing user order for frontend
const placeOrder = async (req, res) =>{

    const frontend_url = 'http://localhost:5173';
    try {
        const newOrder = new orderModel({userId  :  req.body.userId,
                                         items   :  req.body.items,
                                         amount  : req.body.amount,
                                         address :  req.body.address})

        await newOrder.save();
        await userModel.findByIdAndUpdate(id     = req.body.userId,
                                          update = {cartData : {}});

        const line_items = req.body.items.map((item)=>({
            price_data : {
                currency     : "lkr",
                product_data : {name : item.name},
                unit_amount  : item.price*100*300
            },
            quantity : item.quantity
        }))

        line_items.push({
            price_data : {
                currency     : "lkr",
                product_data : {name : "Delivery Charges"},
                unit_amount  : 2*100*80
            },
            quantity : 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items   : line_items,
            mode         : 'payment',
            success_url  : `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url   : `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        })

        res.json({success     : true, 
                  session_url : session.url})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

const verifyOrder = async (req, res) =>{
    const {orderId, success} = req.body;
    try {
        if(success=='true'){
            // Get order details
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.json({success : false, 
                                 message : "Order not found"});
            }

            // Update stock for each item in the order
            for (const orderItem of order.items) {
                const foodItem = await foodModel.findById(orderItem._id);
                if (foodItem) {
                    // Make sure we don't go below 0 stock
                    const newStock = Math.max(0, foodItem.stock - orderItem.quantity);
                    await foodModel.findByIdAndUpdate(id     = orderItem._id, 
                                                      update = {stock     : newStock,
                                                                updatedAt : Date.now()});
                }
            }

            // Mark order as paid
            await orderModel.findByIdAndUpdate(id     = orderId, 
                                               update = {payment : true});
            res.json({success : true, 
                      message : "Paid and stock updated"})
        }else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success : false, 
                      message : "Not Paid"})
        }
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

// user orders for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId : req.body.userId})
        res.json({success : true, 
                  data    : orders})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})
    }
}

// listing orders for admin panel
const listOrders = async (req,res) =>{
   try {
    const orders = await orderModel.find({});
    res.json({success : true, 
              data    : orders})
   } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})  
   } 
}

// api for updating order status
const updateStatus = async (req, res) =>{
    try {
        await orderModel.findByIdAndUpdate(id     = req.body.orderId,
                                           update = {status : req.body.status})
        res.json({success:true, message:"Status Updated"})
    } catch (error) {
        console.log(error)
        res.json({success : false, 
                  message : error})  
    }
}

export {placeOrder, 
        verifyOrder, 
        userOrders,
        listOrders, 
        updateStatus}