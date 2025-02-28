import mongoose, { Schema, Document } from "mongoose";

export enum ChatType {
  ONE_TO_ONE = "one_to_one",
  GROUP = "group",
}

export interface IChat extends Document {
  type: ChatType;
  participants: mongoose.Types.ObjectId[];
  groupName?: string;
  groupPic?: string;
  isPrivate?: boolean;
  isPremium?: boolean;
  consultationFee?: number;
  backgroundImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: Object.values(ChatType), required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    groupName: { type: String },
    groupPic: { type: String },
    isPrivate: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    consultationFee: { type: Number },
    backgroundImage: { type: String },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
