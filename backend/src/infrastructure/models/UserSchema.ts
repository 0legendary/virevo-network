import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EXPERT = "expert",
  USER = "user",
}

export interface IUser extends Document {
  name: string;
  googleId: string;
  anonymousName: string;
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
  privacySettings: {
    showProfile: boolean;
    showLastSeen: boolean;
    showOnlineStatus: boolean;
  };
  rating: { totalPoints: number; ratedBy: number };
  notifications: { type: string; read: boolean; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    googleId: { type: String },
    anonymousName: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isAnonymous: { type: Boolean, default: true },
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
    privacySettings: {
      showProfile: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
    },
    rating: {
      totalPoints: { type: Number, default: 0 },
      ratedBy: { type: Number, default: 0 },
    },
    notifications: [
      {
        type: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
