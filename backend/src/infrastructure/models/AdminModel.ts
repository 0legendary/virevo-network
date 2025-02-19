// src/infrastructure/models/AdminModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdminDocument extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
}

const AdminSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true }
});

export default mongoose.model<IAdminDocument>("Admin", AdminSchema);
