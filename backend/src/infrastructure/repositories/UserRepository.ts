// src/infrastructure/repositories/UserRepository.ts
import  { UserModel, IUser } from "../models/UserSchema";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";

export class UserRepository implements IUserRepository {
  async getDashboardData(): Promise<User[]> {
    const user: IUser[] = await UserModel.find();
    // return user.map(admin => new User(admin.username, admin.email));
    return user.map(user => new User());
  }
}
