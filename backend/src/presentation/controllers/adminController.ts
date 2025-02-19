// src/presentation/controllers/adminController.ts
import { Request, Response } from "express";
import { getAdminDashboard } from "../../application/admin/getAdminDashboard";

export const adminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getAdminDashboard();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
