import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EXPERT = "expert",
  USER = "user",
}

export interface IUser extends Document {
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
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    anonymousName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isAnonymous: { type: Boolean, default: false },
    profilePic: { type: String },
    phoneNumber: { type: String },
    bio: { type: String },
    interests: [{ type: String }],
    expertDetails: {
      expertise: { type: String },
      experienceYears: { type: Number },
      consultationFee: { type: Number },
      ratings: [{ type: Number }],
    },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
