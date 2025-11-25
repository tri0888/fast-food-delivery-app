import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from 'cors';
import ExpressMongoSanitize from "express-mongo-sanitize";

import globalErrorHandler from "./controllers/errorController.js";
import AppError from './utils/appError.js';

import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js';
import orderRouter from './routes/orderRoute.js';
import cartRouter from './routes/cartRoute.js';
import restaurantRouter from './routes/restaurantRoute.js';
import { handleStripeWebhook } from './modules/Payment/stripeWebhook/Controller.js';

//app config
const app = express()

// middleware
// Set security HTTP headers
app.use(helmet())

app.use(morgan('dev'));

app.post('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)
app.get('/api/payment/stripe/webhook', (_req, res) => {
    res.json({ status: 'ok', message: 'Stripe webhook endpoint ready' })
})

app.use(express.json());
// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize())
// Data sanitization against XSS
// app.use(xssSanitize())

app.use(cors())

app.use('/images', express.static('uploads', {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// api endpoints
app.use("/api/food", foodRouter)
// app.use("/images", express.static('uploads'))
app.use('/api/user', userRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/restaurant', restaurantRouter)
app.get("/", (req, res) => {
    res.send("API working")
})
// Capture all falsy url
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
