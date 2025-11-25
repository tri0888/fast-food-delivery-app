import mongoose from 'mongoose';

const ORDER_STATUSES   = ['Pending Confirmation', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled']
const PAYMENT_STATUSES = ['pending', 'authorized', 'captured', 'failed']

const orderItemSchema = new mongoose.Schema({foodId   : {type     : mongoose.Schema.ObjectId,
                                                         ref      : 'food',
                                                         required : [true, 'Order items must reference a food']},
                                             name     : {type     : String,
                                                         required : [true, 'Order items must include a name']},
                                             price    : {type     : Number,
                                                         required : [true, 'Order items must include a price']},
                                             quantity : {type     : Number,
                                                         required : [true, 'Order items must include a quantity'],
                                                         min      : [1, 'Quantity must be at least 1']},
                                             image    : {type     : String }
                                        }, { _id: false })

const orderSchema = new mongoose.Schema({userId              : {type     : String, 
                                                                required : [true, "An order must have a userId"]},
                                         res_id              : {type     : mongoose.Schema.ObjectId,
                                                                ref      : 'Restaurant',
                                                                required : [true, "An order must belong to a restaurant"]},
                                         amount              : {type     : Number, 
                                                                required : [true, "An order must have amount"]},
                                         address             : {type     : Object, 
                                                                required : [true, "An order must have an address"]},
                                         food_items          : {type     : [orderItemSchema],
                                                                default  : []},
                                         status              : {type     : String,
                                                                enum     : ORDER_STATUSES,
                                                                default  : 'Pending Confirmation'},
                                         paymentStatus       : {type     : String,
                                                                enum     : PAYMENT_STATUSES,
                                                                default  : 'pending'},
                                         stripeSessionId     : {type     : String},
                                         stripePaymentIntent : {type     : String},
                                        //  drone_id            : {type     : mongoose.Schema.ObjectId,
                                        //                         ref      : 'Drone',
                                        //                         required : [true, "An order must belong to a drone"]},
                                         deliveredAt         : {type     : Date},
                                         date                : {type     : Date, 
                                                                default  : Date.now()}},
                                        {timestamps: true})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel;
