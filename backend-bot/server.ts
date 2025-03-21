import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './controller/bot/botController';
dotenv.config();
import { connectDB } from "./config/db";

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);
const BACKEND_URL = process.env.BACKEND_URL || `https://virevo-network.onrender.com`;

setInterval(() => {
    fetch(BACKEND_URL)
        .then(res => console.log(`Keep-alive ping sent at ${new Date().toLocaleTimeString()}`))
        .catch(err => console.log("Keep-alive ping failed:", err));
}, 10 * 60 * 1000);

app.use(cors({ origin: "*" }));
app.use(express.json());
connectDB();
app.listen(PORT, '0.0.0.0', () => console.log(`Bot server running on port ${PORT}`));
