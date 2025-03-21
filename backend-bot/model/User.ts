
import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Response document
interface IResponse {
  question: string;
  answer: string;
  timestamp: Date;
}

// Interface for the dailyResponses array element
interface IDailyResponse {
  date: string;
  responses: IResponse[];
}

// Interface for the User document
interface IUser extends Document {
  userId: number;
  chatId: number;
  name?: string;
  chatType: 'private' | 'group';
  groupId?: number;
  dailyResponses: IDailyResponse[];
  conversation: IResponse[];
}

// Response Schema
const responseSchema: Schema<IResponse> = new Schema<IResponse>({
  question: { type: String, required: false },
  answer: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

// User Schema
const userSchema: Schema<IUser> = new Schema<IUser>({
  userId: { type: Number, required: true, unique: true },
  chatId: { type: Number, required: true },
  name: { type: String, required: false },
  chatType: { type: String, enum: ['private', 'group'], required: true },
  groupId: { type: Number, required: false },
  dailyResponses: [
    {
      date: { type: String, required: true },
      responses: [responseSchema],
    },
  ],
});

// User Model
const TeleUser = mongoose.model<IUser>('TeleUser', userSchema);

export default TeleUser;
