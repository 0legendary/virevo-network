import { Request, Response } from "express";
import { getUserDashboard } from "../../application/user/getUserDashboard";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { ApiResponse } from "../dto/ApiResponse";
import { UserModel } from "../../infrastructure/models/UserSchema";


export const fetchUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      res.status(200).json(response);
      return
    }
    const { password: _, ...userData } = user.toObject();
    const responseData = {
      userData
    }
    const response: ApiResponse = {
      success: true,
      message: "User fetched successfully",
      data: responseData,
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const userDashboard = async (req: Request, res: Response) => {
  try {
    const repo = new UserRepository();
    const data = await getUserDashboard(repo);

    const response: ApiResponse = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      data: null,
    };
    res.status(500).json(response);
  }
};

