import mongoose from 'mongoose';

export enum ChatType {
    PRIVATE = 'private',
    GROUP = 'group',
}

export interface IParticipant {
    _id: string;
    name: string;
    email: string;
    profilePic: string | null;
}

export interface ILastMessage {
    content: string;
    sender: {
        _id: string;
        name: string;
        profilePic: string;
    };
    type: MessageType;
    sentAt: Date;
    deliveredAt?: Date;
    seenBy?: { userId: string; seenAt: Date }[];
}

export interface IChat {
    _id: string;
    type: ChatType;
    participants: IParticipant[];
    groupName?: string;
    groupPic?: string | null;
    isPrivate: boolean;
    isPremium: boolean;
    consultationFee: number;
    backgroundImage?: string;
    lastMessage?: ILastMessage;
    createdAt: Date;
    updatedAt: Date;
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    SYSTEM = 'system',
    SCRATCH_CARD = 'scratch_card',
    ONE_TIME_VIEW = 'one_time_view',
    POLL = 'poll',
}

export interface IMessage {
    _id: string;
    chatId: string;
    sender: {
        _id: string;
        name: string;
        profilePic?: string;
    };
    type: MessageType;
    content: string;
    mediaUrl?: string;
    reactions?: { emoji: string; users: string[] }[];
    replyTo?: string | null;
    scheduledAt?: Date | null;
    autoDeleteAt?: Date | null;
    seenBy?: { userId: string; seenAt: Date }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatReducer {
    chats: IChat[];
    selectedChat: IChat | null;
    messages: IMessage[];
    loading: boolean;
    error: string | null;
}

export interface IMessagePayload {
    chatId: mongoose.Types.ObjectId;
    message: IMessage;
}

export interface IChatPayload {
    chat: IChat;
}

export interface IMessageUpdatePayload {
    message: IMessage;
}

export interface SideBarUIState {
    uiState: {
        isLoading: boolean;
        isMenuOpen: boolean;
        activeFilter: string;
    };
}

export interface IChatPage {
    uiState: {
        screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        activeView: 'sidebar' | 'chat' | 'details';
    };
}
