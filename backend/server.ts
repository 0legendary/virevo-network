// src/server.ts
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./src/presentation/routes/userRoutes";
import { connectDB } from "./src/config/db";

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Set up routes
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
