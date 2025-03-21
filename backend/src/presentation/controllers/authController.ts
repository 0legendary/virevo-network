import { Request, Response } from "express";
import { ApiResponse } from "../dto/ApiResponse";
import { UserModel } from "../../infrastructure/models/UserSchema";
import { storeOTP, verifyOTP } from "../../application/services/otpService";
import { sendVerificationEmail } from "../../utils/emailService";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, TokenPayload, verifyRefreshToken } from "../../application/services/jwtService";

export const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    
    if (!refreshToken) {
        res.status(401).json({ success: false, message: "Refresh token missing" });
        return
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
        res.status(403).json({ success: false, message: "Invalid refresh token" });
        return
    }

    const newAccessToken = generateAccessToken(decoded);
    res.status(200).json({ success: true, accessToken: newAccessToken });
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body.requestData;

        const user = await UserModel.findOne({ email });
        if (!user) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid email or password",
            };
            res.status(200).json(response);
            return
        }

        if (user.googleId && !user.password) {
            const response: ApiResponse = {
                success: false,
                message: "This account is linked with Google. Please log in using Google",
            };
            res.status(200).json(response);
            return;
        }

        // Ensure password exists before attempting bcrypt comparison
        if (!user.password) {
            const response: ApiResponse = {
                success: false,
                message: "No password set for this account. Please reset your password or log in using Google.",
            };
            res.status(200).json(response);
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid email or password",
            };
            res.status(200).json(response);
            return
        }

        const payload: TokenPayload = {
            _id: user._id,
            anonymousName: user.anonymousName,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const { password: _,googleId:__, ...userData } = user.toObject();
        const responseData = {
            userData,
            accessToken
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const response: ApiResponse = {
            success: true,
            message: "Login successful",
            data: responseData,
        };
        res.status(200).json(response);
        return

    } catch (error: any) {
        console.log(error);
        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { userInfo} = req.body.requestData;
        const { sub: googleId, name, email, picture } = userInfo;
        
        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({
                googleId,
                name,
                anonymousName: name,
                email,
                profilePic: picture
            });
        }

        const payload = {
            _id: user._id,
            anonymousName: user.anonymousName,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const { password: _,googleId:__, ...userData } = user.toObject();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: 'localhost'
        });

        const response: ApiResponse = {
            success: true,
            message: "User authenticated successfully",
            data: {userData,accessToken} 
        };
        res.status(201).json(response);

    } catch (error: any) {
        console.log(error);
        const response: ApiResponse = {
            success: false,
            message: "Google authentication failed",
        };
        res.status(500).json(response);
    }
};

export const signup = async (req: Request, res: Response) => {
    try {
        const { anonymousName, email, password } = req.body.requestData;
        const existingUser = await UserModel.findOne({
            $or: [{ anonymousName }, { email }],
        });
        if (existingUser) {
            const response: ApiResponse = {
                success: false,
                message: "Anonymous name is already taken",
            };
            res.status(200).json(response);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await UserModel.create({
            anonymousName,
            email,
            password: hashedPassword,
        });

        const payload: TokenPayload = {
            _id: newUser._id,
            anonymousName: newUser.anonymousName,
            email: newUser.email,
            role: newUser.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const { password: _,googleId:__, ...userData } = newUser.toObject();
        const responseData = {
            userData,
            accessToken
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        const response: ApiResponse = {
            success: true,
            message: "User registered successfully",
            data: responseData,
        };
        res.status(201).json(response);
        return

    } catch (error: any) {
        console.log(error);
        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};

export const newOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body.requestData;
        const existingUserByEmail = await UserModel.findOne({ email });
        if (!existingUserByEmail) {
            const response: ApiResponse = {
                success: false,
                message: "Email is not registered. Try with another.",
            };
            res.status(200).json(response);
            return;
        }
        const otp = Math.floor(10000 + Math.random() * 90000);
        await storeOTP(email, otp.toString());
        const emailStatus = sendVerificationEmail(email, otp);
        if (!emailStatus) {
            const response: ApiResponse = {
                success: false,
                message: "Failed to send verification email",
                data: 'email'
            };
            res.status(200).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            message: "OTP sent successfully",
        };
        res.status(200).json(response);
    } catch (error: any) {
        console.log(error);

        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};


export const newUser = async (req: Request, res: Response) => {
    try {
        const { anonymousName, email } = req.body.requestData;
        const existingUser = await UserModel.findOne({ anonymousName });
        if (existingUser) {
            const response: ApiResponse = {
                success: false,
                message: "Anonymous name is already taken",
                data: 'anonymousName'
            };
            res.status(200).json(response);
            return;
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail) {
            const response: ApiResponse = {
                success: false,
                message: "Email is already taken. Try with another.",
                data: 'email'
            };
            res.status(200).json(response);
            return;
        }
        const otp = Math.floor(10000 + Math.random() * 90000);
        await storeOTP(email, otp.toString());
        const emailStatus = sendVerificationEmail(email, otp);
        if (!emailStatus) {
            const response: ApiResponse = {
                success: false,
                message: "Failed to send verification email",
                data: 'email'
            };
            res.status(200).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            message: "OTP sent successfully",
        };
        res.status(200).json(response);
    } catch (error: any) {
        console.log(error);

        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body.requestData;

        if (!email || !otp) {
            const response: ApiResponse = {
                success: false,
                message: "Email and OTP are required.",
                data: "validation",
            };
            res.status(400).json(response);
            return
        }

        const isValid = await verifyOTP(email, otp);

        if (!isValid) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid or expired OTP.",
                data: "otp",
            };
            res.status(200).json(response);
            return
        }

        const response: ApiResponse = {
            success: true,
            message: "OTP verified successfully.",
        };
        res.status(200).json(response);
        return

    } catch (error: any) {
        console.log(error);

        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};


export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body.requestData;

        if (!email || !password) {
            const response: ApiResponse = {
                success: false,
                message: "Email and password are required.",
            };
            res.status(200).json(response);
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            const response: ApiResponse = {
                success: false,
                message: "User not found.",
            };
            res.status(200).json(response);
            return
        }

        const response: ApiResponse = {
            success: true,
            message: "Password updated successfully.",
        };
        res.status(200).json(response);
        return
    } catch (error: any) {
        console.log(error);

        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};
