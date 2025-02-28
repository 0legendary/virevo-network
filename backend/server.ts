// src/server.ts
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./src/presentation/routes/userRoutes";
import authRoutes from "./src/presentation/routes/authRoutes";
import { connectDB } from "./src/config/db";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  
// Connect to MongoDB
connectDB();

// Set up routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
