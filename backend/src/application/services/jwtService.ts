import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export interface TokenPayload {
  _id: any;
  anonymousName: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_EXPIRY = "15m"; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d";  // Refresh token expires in 7 days

// Generate Access Token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Generate Refresh Token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

// Middleware to verify Access Token
export const verifyAccessToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token expired or invalid" });
    }
    req.body.user = decoded;
    next();
  });
};

// Middleware to verify Refresh Token
export const verifyRefreshToken = (refreshToken: string): Promise<TokenPayload | null> => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return resolve(null);
      resolve(decoded as TokenPayload);
    });
  });
};
