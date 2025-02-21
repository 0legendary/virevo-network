// src/domain/interfaces/IUserRepository.ts
import { User } from "../entities/User";

export interface IUserRepository {
  getDashboardData(): Promise<User[]>;
}
