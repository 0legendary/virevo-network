import { Request, Response } from "express";
import { getUserDashboard } from "../../application/user/getUserDashboard";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { ApiResponse } from "../dto/ApiResponse";

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

