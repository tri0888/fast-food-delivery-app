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

//app config
const app = express()

// CORS
// - Default: allow all origins (keeps local dev + existing tests working)
// - If CORS_ORIGINS is provided (comma-separated), only allow those origins
//   Example: CORS_ORIGINS=https://<user>.github.io,https://<user>.github.io/<repo>
const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const corsOptions = corsOrigins.length
    ? {
        origin: (origin, cb) => {
            // Allow non-browser requests (no Origin header), e.g. tests, curl, server-to-server
            if (!origin) return cb(null, true);
            if (corsOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`));
        },
      }
    : undefined;

// middleware
// Set security HTTP headers
// app.use(helmet())

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize())
// Data sanitization against XSS
// app.use(xssSanitize())

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use('/api/user', userRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.get("/", (req, res) => {
    res.send("API working")
})
// Capture all falsy url
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
