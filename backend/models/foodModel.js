import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({name        : {type     : String,
                                                       required : [true, "A food must have a name"]},
                                        description : {type     : String,
                                                       required : [true, "A food must have a description"]},
                                        price       : {type     : Number,
                                                       required : [true, "A food must have a price"]},
                                        image       : {type     : String,
                                                       required : [true, "A food must have a image"]},
                                        category    : {type     : String,
                                                       required : [true, "A food must have a category"]},
                                        res_id      : {type     : mongoose.Schema.ObjectId,
                                                       ref      : 'Restaurant',
                                                       required : [true, "A food must belong to a restaurant"]},

                                        // ✅ Gợi ý thêm
                                        isAvailable : {type    : Boolean, 
                                                       default : true },  // Ẩn/hiện món ăn
                                        stock       : {type    : Number, 
                                                       default : 0 },            // Quản lý tồn kho                                                                            
                                        createdAt   : {type    : Date, 
                                                       default : Date.now},   // Thời gian tạo
                                        updatedAt   : {type    : Date, 
                                                       default : Date.now }},    // Thời gian cập nhật
                                        {timestamps : true} ) // tự động thêm createdAt & updatedAt

const foodModel = mongoose.model.food || mongoose.model("food",foodSchema);

export default foodModel;