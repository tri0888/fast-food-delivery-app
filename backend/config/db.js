import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://tri0888:1234@cluster0.4nowenc.mongodb.net/fast-food').then(()=>{
       console.log('DB connected') ;
    })
}