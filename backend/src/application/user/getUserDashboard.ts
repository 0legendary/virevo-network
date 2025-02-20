// src/application/user/getUserDashboard.ts
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";

export const getUserDashboard = async () => {
  const repo: IUserRepository = new UserRepository();
  return await repo.getDashboardData();
};
