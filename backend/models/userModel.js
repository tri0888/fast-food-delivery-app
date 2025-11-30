import mongoose from "mongoose";

const userSchema = new mongoose.Schema({name       : {type     : String, 
                                                      required : [true, "An user must have a name"]},
                                        email      : {type     : String, 
                                                      required : [true, "An user must have a email"], 
                                                      unique   : true},
                                        password   : {type     : String,
                                                      required : [true, "An user must have a password"]},
                                        role       : {type: String,
                                                      enum: ['user', 'admin', 'superadmin'],
                                                      default: 'user'},
                                        res_id     : {type: mongoose.Schema.ObjectId,
                                                      ref: 'Restaurant'},
                                        cartData   : {type    : Object, 
                                                      default : {}},
                                        cartLocks  : {type    : Map,
                                                      of       : Boolean,
                                                      default  : {}}
                                        },
                                        {minimize  : false})

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;