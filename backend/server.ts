// src/server.ts
import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./src/presentation/routes/adminRoutes";
import { connectDB } from "./src/config/db";

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Set up routes
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
