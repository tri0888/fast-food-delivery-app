import mongoose from "mongoose";
import dotenv from 'dotenv';

// Hanle uncaught exception (operational)
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});


// config
dotenv.config({path: "./.env"})
import app from "./app.js"
import { hydrateReturningDrones } from './modules/Orders/droneTracking/droneTrackingService.js'


//db connection
const DB = process.env.NODE_ENV === "docker"
    ? process.env.DATABASE_DOCKER.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// connectDB();
mongoose
    .connect(DB)
    .then(async () => {
        console.log('DB connected') ;
        try {
            await hydrateReturningDrones()
        } catch (error) {
            console.error('Unable to hydrate drone fleet timers', error)
        }
    })

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})

// Handle unhandled rejection (promise)
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
