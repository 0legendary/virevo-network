// src/presentation/controllers/userController.ts
import { Request, Response } from "express";
import { getUserDashboard } from "../../application/user/getUserDashboard";

export const userDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getUserDashboard();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
