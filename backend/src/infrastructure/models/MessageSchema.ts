import mongoose, { Schema, Document } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  SYSTEM = "system",
  SCRATCH_CARD = "scratch_card",
  ONE_TIME_VIEW = "one_time_view",
  POLL = "poll",
}

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  reactions?: { emoji: string; users: mongoose.Types.ObjectId[] }[];
  replyTo?: mongoose.Types.ObjectId;
  scheduledAt?: Date;
  autoDeleteAt?: Date;
  sentAt: Date;
  deliveredTo: { userId: mongoose.Types.ObjectId; deliveredAt: Date }[]; // Track per-user delivery
  seenBy: { userId: mongoose.Types.ObjectId; seenAt: Date }[]; // Track per-user seen status
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(MessageType), required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    reactions: [
      {
        emoji: { type: String },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    scheduledAt: { type: Date },
    autoDeleteAt: { type: Date },
    sentAt: { type: Date, default: Date.now }, // Message sent timestamp
    deliveredTo: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        deliveredAt: { type: Date },
      },
    ], // Track when each user received the message
    seenBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date },
      },
    ], // Track when each user saw the message
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
