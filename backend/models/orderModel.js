import mongoose from 'mongoose';

const ORDER_STATUSES         = ['Pending Confirmation', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled']
const PAYMENT_STATUSES       = ['pending', 'authorized', 'captured', 'failed']
const DRONE_CUSTOMER_STATUS  = ['awaiting-drone', 'preparing', 'flying', 'delivered', 'cancelled']
const DRONE_ADMIN_STATUSES   = [...DRONE_CUSTOMER_STATUS, 'idle', 'returning']
const DEFAULT_FLIGHT_SECONDS = Number(process.env.DRONE_ANIMATION_SECONDS || 180)

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

const coordinatesSchema = new mongoose.Schema({lat   : {type : Number, default : null},
                                               lng   : {type : Number, default : null},
                                               label : {type : String, trim : true}}, {_id: false})

const droneHistorySchema = new mongoose.Schema({status : {type : String},
                                                at     : {type : Date, default : Date.now}}, {_id: false})

const droneTrackingSchema = new mongoose.Schema({assignedDrone        : {type    : mongoose.Schema.ObjectId,
                                                                         ref     : 'drone',
                                                                         default : null},
                                                 status               : {type    : String,
                                                                         enum    : DRONE_CUSTOMER_STATUS,
                                                                         default : 'awaiting-drone'},
                                                 adminStatus          : {type    : String,
                                                                         enum    : DRONE_ADMIN_STATUSES,
                                                                         default : 'awaiting-drone'},
                                                 awaitingSince        : {type : Date, default : () => new Date()},
                                                 restaurantLocation   : {type : coordinatesSchema, default : undefined},
                                                 customerLocation     : {type : coordinatesSchema, default : undefined},
                                                 animationDurationSec : {type : Number,
                                                                         default : DEFAULT_FLIGHT_SECONDS},
                                                 returnDurationSec    : {type : Number,
                                                                         default : null},
                                                 lastUpdated          : {type : Date, default : () => new Date()},
                                                 history              : {type : [droneHistorySchema], default : []}
                                                }, {_id: false})

const orderSchema = new mongoose.Schema({
     userId            : {type     : String, required : [true, "An order must have a userId"]},
     res_id            : {type     : mongoose.Schema.ObjectId,
                               ref      : 'Restaurant',
                               required : [true, "An order must belong to a restaurant"]},
     amount            : {type     : Number, required : [true, "An order must have amount"]},
     address           : {type     : Object, required : [true, "An order must have an address"]},
     food_items        : {type     : [orderItemSchema], default : []},
     status            : {type     : String, enum : ORDER_STATUSES, default : 'Pending Confirmation'},
     paymentStatus     : {type     : String, enum : PAYMENT_STATUSES, default : 'pending'},
     stripeSessionId   : {type     : String},
     stripePaymentIntent: {type    : String},
     //  drone_id       : {type     : mongoose.Schema.ObjectId,
     //                    ref      : 'Drone',
     //                    required : [true, "An order must belong to a drone"]},
     deliveredAt       : {type     : Date},
     date              : {type     : Date, default : Date.now()},
     droneTracking     : {type     : droneTrackingSchema,
                               default  : () => ({
                                    status        : 'awaiting-drone',
                                    adminStatus   : 'awaiting-drone',
                                    awaitingSince : new Date(),
                                    history       : []
                               })}
}, {timestamps: true})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel;
