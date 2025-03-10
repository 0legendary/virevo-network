export enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    EXPERT = "expert",
    USER = "user",
  }
  
  export interface IUser {
    _id: string;
    name: string;
    anonymousName:string;
    email: string;
    password: string;
    role: UserRole;
    isAnonymous: boolean;
    profilePic?: string;
    phoneNumber?: string;
    bio?: string;
    interests?: string[];
    expertDetails?: {
      expertise: string;
      experienceYears: number;
      consultationFee: number;
      ratings: number[];
    };
    walletBalance?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  