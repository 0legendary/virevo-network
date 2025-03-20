import { ApiResponse } from "../dto/ApiResponse";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ChatModel } from "../../infrastructure/models/ChatSchema";
import { MessageModel } from "../../infrastructure/models/MessageSchema";
import { UserModel } from "../../infrastructure/models/UserSchema";
import mongoose from "mongoose";


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

export const getAllUsers = async (req: Request, res: Response) => {
    try {        
        const { userID } = req.query;
        const limit = parseInt(req.query.limit as string) || 15;
        const page = parseInt(req.query.page as string) || 1;
        console.log(userID,limit,page);
        
        const userObjectId = new mongoose.Types.ObjectId(userID as string);

        const users = await UserModel.find(
            { _id: { $ne: userObjectId } },
            "_id name profilePic anonymousName"
        )
        .skip((page - 1) * limit)
        .limit(limit);
        

        const totalUsers = await UserModel.countDocuments({ _id: { $ne: userID } });

        // Fetch existing chats where the user is a participant
        const chats = await ChatModel.find(
            { participants: userID },
            "participants lastMessage"
        ).populate("lastMessage.sender", "name profilePic");

        // Create a map to store last messages
        const lastMessagesMap = new Map();
        chats.forEach(chat => {
            const otherUser = chat.participants.find(
                (id: mongoose.Types.ObjectId) => id.toString() !== userID
            );

            if (otherUser && chat.lastMessage) {
                lastMessagesMap.set(otherUser.toString(), {
                    content: chat.lastMessage.content,
                    sender: chat.lastMessage.sender,
                    sentAt: chat.lastMessage.sentAt,
                });
            }
        });

        // Format the response with last message if exists
        const userList = users.map(user => ({
            _id: user._id,
            name: user.name,
            profilePic: user.profilePic,
            anonymousName: user.anonymousName,
            lastMessage: lastMessagesMap.get((user._id as mongoose.Types.ObjectId).toString()) || null,
        }));

        res.status(200).json({
            success: true,
            message: "Fetched all users for chat",
            data: {users: userList, totalUsers, hasMore: (page * limit) < totalUsers,},
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
