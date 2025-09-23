import express from 'express'
import cors from 'cors'
import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config({path: "./.env"})

import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js';
import orderRouter from './routes/orderRoute.js';
import cartRouter from './routes/cartRoute.js';

//app config
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

//db connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
// connectDB();
mongoose
    .connect(DB)
    .then(() => {
        console.log('DB connected') ;
    }
)

// api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use('/api/user', userRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})