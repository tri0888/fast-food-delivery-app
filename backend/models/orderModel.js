import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({userId   : {type     : String, 
                                                     required : [true, "An order must have a userId"]},
                                                                                 items    : {type     : Array, 
                                                                                                         required : [true, "An order must have items"],
                                                                                                         validate : {
                                                                                                             validator : (items) => Array.isArray(items) && items.length > 0,
                                                                                                             message   : 'An order must contain at least one item'
                                                                                                         }},
                                         amount   : {type     : Number, 
                                                     required : [true, "An order must have amount"]},
                                         address  : {type     : Object, 
                                                     required : [true, "An order must have an address"]},
                                         status   : {type     : String, 
                                                     default  : "Food Processing"},
                                         date     : {type     : Date, 
                                                     default  : Date.now()},
                                         payment  : {type     : Boolean, 
                                                     default  : false}})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel;
