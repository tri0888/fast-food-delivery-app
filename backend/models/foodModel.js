import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type: String,required: true},
    description: {type: String,required: true},
    price: {type: Number,required: true},
    image: {type: String,required: true},
    category: {type: String,required: true},
// ✅ Gợi ý thêm
    isAvailable: { type: Boolean, default: true },  // Ẩn/hiện món ăn
    stock: { type: Number, default: 0 },            // Quản lý tồn kho
    discount: { type: Number, default: 0 },         // % giảm giá
    rating: { type: Number, default: 0, min: 0, max: 5 }, // Điểm trung bình từ khách hàng
    
    createdAt: { type: Date, default: Date.now },   // Thời gian tạo
    updatedAt: { type: Date, default: Date.now }    // Thời gian cập nhật
}, { timestamps: true }) // tự động thêm createdAt & updatedAt

const foodModel = mongoose.model.food || mongoose.model("food",foodSchema);

export default foodModel;