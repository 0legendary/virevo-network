// src/application/admin/getAdminDashboard.ts
import { IAdminRepository } from "../../domain/interfaces/IAdminRepository";
import { AdminRepository } from "../../infrastructure/repositories/AdminRepository";

export const getAdminDashboard = async () => {
  const repo: IAdminRepository = new AdminRepository();
  return await repo.getDashboardData();
};
