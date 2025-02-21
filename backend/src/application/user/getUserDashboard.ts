// src/application/user/getUserDashboard.ts
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export const getUserDashboard = async (repo: IUserRepository): Promise<User[]> => {
  return await repo.getDashboardData();
};
