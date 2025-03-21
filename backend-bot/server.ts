import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './controller/bot/botController';
dotenv.config();
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 8080;

setInterval(() => {
    fetch(`${process.env.BACKEND_URL}`)
        .then(res => console.log(`Keep-alive ping sent at ${new Date().toLocaleTimeString()}`))
        .catch(err => console.log("Keep-alive ping failed:", err));
}, 10 * 60 * 1000);

app.use(cors({ origin: "*" }));
app.use(express.json());
connectDB();
app.listen(PORT, () => console.log(`Bot server running on port ${PORT}`));
