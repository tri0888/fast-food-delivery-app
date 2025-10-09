import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from 'cors';
import ExpressMongoSanitize from "express-mongo-sanitize";

import globalErrorHandler from "./controllers/errorController.js";
import AppError from './utils/appError.js';

import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js';

//app config
const app = express()

// middleware
// Set security HTTP headers
// app.use(helmet())

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize())
// Data sanitization against XSS
// app.use(xssSanitize())

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())

// api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use('/api/user', userRouter)
app.get("/", (req, res) => {
    res.send("API working")
})
// Capture all falsy url
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
