// src/infrastructure/repositories/AdminRepository.ts
import AdminModel, { IAdminDocument } from "../models/AdminModel";
import { IAdminRepository } from "../../domain/interfaces/IAdminRepository";
import { Admin } from "../../domain/entities/Admin";

export class AdminRepository implements IAdminRepository {
  async getDashboardData(): Promise<Admin[]> {
    const admins: IAdminDocument[] = await AdminModel.find();
    return admins.map(admin => new Admin(admin._id.toString(), admin.username, admin.email));
  }
}
