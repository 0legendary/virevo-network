import { ApiResponse } from "../dto/ApiResponse";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ChatModel } from "../../infrastructure/models/ChatSchema";
import { MessageModel } from "../../infrastructure/models/MessageSchema";


export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const reqData = req as AuthRequest;
        const userData = reqData.user;

        if (!userData) {
            const response: ApiResponse = {
                success: false,
                message: "User not found",
            };
            res.status(401).json(response);
            return
        }

        // Find all chats where the user is a participant
        const chats = await ChatModel.find({ participants: userData.id })
            .populate("participants", "name email profilePic") // Populate user details
            .lean(); // Convert to plain objects for easier modification

        if (!chats.length) {
            const response: ApiResponse = {
                success: false,
                message: "No chat history found",
            };
            res.status(200).json(response);
            return
        }

        // Fetch last message for each chat
        const chatHistory = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await MessageModel.findOne({ chatId: chat._id })
                    .sort({ createdAt: -1 }) // Get the latest message
                    .select("content sender type sentAt deliveredTo seenBy")
                    .populate("sender", "name email profilePic")
                    .lean();

                return {
                    _id: chat._id,
                    type: chat.type,
                    participants: chat.participants,
                    groupName: chat.groupName || null,
                    groupPic: chat.groupPic || null,
                    isPrivate: chat.isPrivate,
                    isPremium: chat.isPremium,
                    consultationFee: chat.consultationFee || 0,
                    backgroundImage: chat.backgroundImage || null,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                    lastMessage: lastMessage
                        ? {
                            content: lastMessage.content,
                            sender: lastMessage.sender,
                            type: lastMessage.type,
                            sentAt: lastMessage.sentAt,
                            deliveredTo: lastMessage.deliveredTo,
                            seenBy: lastMessage.seenBy,
                        }
                        : null,
                };
            })
        );

        const response: ApiResponse = {
            success: true,
            message: "Chat history fetched successfully",
            data: chatHistory,
        };

        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        
        if (!chatId) {
            const response: ApiResponse = {
                success: false,
                message: "No chat id found",
            };
            res.status(200).json(response);
            return
        }

        const chatHistory = await MessageModel.findOne({ chatId });
        if (!chatHistory) {
            const response: ApiResponse = {
                success: false,
                message: "No chat history found",
            };
            res.status(200).json(response);
            return
        }

        const response: ApiResponse = {
            success: true,
            message: "Message Fetched successfully",
            data: chatHistory,
        };
        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};