// src/domain/interfaces/IAdminRepository.ts
import { Admin } from "../entities/Admin";

export interface IAdminRepository {
  getDashboardData(): Promise<Admin[]>;
}
