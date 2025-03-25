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


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];
    // console.log(req.cookies?.refreshToken);
    
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

