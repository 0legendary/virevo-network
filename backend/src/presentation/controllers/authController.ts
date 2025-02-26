import { Request, Response } from "express";
import { ApiResponse } from "../dto/ApiResponse";
import { UserModel } from "../../infrastructure/models/User";
import { storeOTP, verifyOTP } from "../../application/services/otpService";
import { sendVerificationEmail } from "../../utils/emailService";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
    console.log("Logging in user", req.body.requestData);
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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid email or password",
            };
            res.status(200).json(response);
            return
        }

        // Exclude password from response
        const { password: _, ...userData } = user.toObject();
        const responseData = {
            userData,
        }
        // Future JWT space - will implement access/refresh token later
        // const accessToken = generateAccessToken(user._id);
        // const refreshToken = generateRefreshToken(user._id);

        const response: ApiResponse = {
            success: true,
            message: "Login successful",
            data: responseData,
            // token: accessToken,
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


export const signup = async (req: Request, res: Response) => {
    console.log("Signing up new user", req.body.requestData);
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

        // Exclude password from response
        const { password: _, ...userData } = newUser.toObject();
        const responseData = {
            userData,
        }
        // Future JWT space - will implement access/refresh token later
        // const accessToken = generateAccessToken(newUser._id);
        // const refreshToken = generateRefreshToken(newUser._id);


        const response: ApiResponse = {
            success: true,
            message: "User registered successfully",
            data: responseData,
            // token: accessToken,
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
    console.log("Send new OTP",req.body.requestData);
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
    } catch (error:any) {
        console.log(error);

        const response: ApiResponse = {
            success: false,
            message: error.message,
        };
        res.status(500).json(response);
    }
};


export const newUser = async (req: Request, res: Response) => {
    console.log("new user", req.body.requestData);
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
    console.log("Verifying Otp", req.body.requestData);
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
    console.log("Updating password", req.body.requestData);
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
