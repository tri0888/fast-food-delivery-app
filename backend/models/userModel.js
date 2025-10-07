import mongoose from "mongoose";

const userSchema = new mongoose.Schema({name       : {type     : String, 
                                                      required : [true, "An user must have a name"]},
                                        email      : {type     : String, 
                                                      required : [true, "An user must have a email"], 
                                                      unique   : true},
                                        password   : {type     : String,
                                                      required : [true, "An user must have a password"]},
                                        role       : {type: String,
                                                      enum: ['user', 'admin'],
                                                      default: 'user'},
                                        cartData   : {type    : Object, 
                                                      default : {}},
                                        isCartLock : {type    : Boolean, 
                                                      default : false}},
                                        {minimize  : false})

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;