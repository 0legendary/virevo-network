import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: "superadmin" | "admin" | "expert" | "user";
    };
}

// // Middleware to verify Access Token
// export const verifyAccessToken = (req: Request, res: Response, next: Function) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }
  
//     const token = authHeader.split(" ")[1];
  
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ success: false, message: "Token expired or invalid" });
//       }
//       req.body.user = decoded;
//       next();
//     });
//   };

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as AuthRequest["user"];
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
        return;
    }
};


export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Forbidden: Access Denied" });
            return;
        }
        next();
    };
};

