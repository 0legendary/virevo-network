import mongoose, { Schema, Document } from "mongoose";

export interface IDiscussion extends Document {
    title: string;
    description: string;
    creator: mongoose.Types.ObjectId;
    isPremium: boolean;
    expertModerators: mongoose.Types.ObjectId[];
    polls?: { question: string; options: string[]; votes: mongoose.Types.ObjectId[] }[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  const DiscussionSchema = new Schema<IDiscussion>(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
      isPremium: { type: Boolean, default: false },
      expertModerators: [{ type: Schema.Types.ObjectId, ref: "User" }],
      polls: [
        {
          question: { type: String },
          options: [{ type: String }],
          votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        },
      ],
    },
    { timestamps: true }
  );
  
  export const DiscussionModel = mongoose.model<IDiscussion>("Discussion", DiscussionSchema);
  