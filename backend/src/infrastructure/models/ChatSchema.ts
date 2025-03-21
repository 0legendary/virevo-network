import mongoose, { Schema, Document } from "mongoose";

export enum ChatType {
  PRIVATE = "private",
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
  lastMessage?: {
    messageId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    type: string;
    sentAt: Date;
  };
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
    lastMessage: {
      messageId: { type: Schema.Types.ObjectId, ref: "Message" },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      type: { type: String },
      sentAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
