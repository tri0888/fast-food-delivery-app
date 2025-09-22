import userModel from './../models/userModel.js';

// add items to user cart
const addToCart = async (req,res) =>{
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1 
        }
        else{
            cartData[req.body.itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId,{cartData})
        res.json({success:true,message:'Added to cart'});
    } catch (error) {
       console.log(error) ;
       res.json({success:false,message:'Error'});
    }
}

// remove items to user cart
const removeFromCart = async (req, res) =>{
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;

        if(req.body.removeCompletely) {
            // Remove the item completely from cart
            delete cartData[req.body.itemId];
        } else {
            // Decrease quantity by 1
            if(cartData[req.body.itemId]>0){
                cartData[req.body.itemId] -=1;
            }
            // If quantity becomes 0, remove the item
            if(cartData[req.body.itemId] === 0) {
                delete cartData[req.body.itemId];
            }
        }

        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:'Removed from cart'});
    } catch (error) {
        console.log(error) ;
       res.json({success:false,message:'Error'});
    }
}

// fetch user cart data
const getCart = async (req,res) =>{
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        let isCartLocked = await userData.isCartLock;
        res.json({success: true, cartData, isCartLocked});
    } catch (error) {
        console.log(error) ;
        res.json({success:false,message:'Error'});
    }
}

export {addToCart, removeFromCart, getCart}
