import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './controller/bot/botController';
dotenv.config();
import { connectDB } from "./config/db";
import { bot } from './controller/bot/botController';

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
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});
// Set webhook for Telegram bot
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});
app.listen(PORT, '0.0.0.0', () => console.log(`Bot server running on port ${PORT}`));
