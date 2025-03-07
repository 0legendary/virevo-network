import mongoose from 'mongoose';

export enum ChatType {
    PRIVATE = 'private',
    GROUP = 'group',
}

export interface IChat {
    _id: string;
    type: ChatType;
    participants: string[];
    groupName?: string;
    groupPic?: string;
    isPrivate?: boolean;
    isPremium?: boolean;
    consultationFee?: number;
    backgroundImage?: string;
    lastMessage: string;
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
    sender: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    reactions?: { emoji: string; users: string[] }[];
    replyTo?: string | null;
    scheduledAt?: Date | null;
    autoDeleteAt?: Date | null;
    seenBy?: string[]; 
    createdAt: Date;
    updatedAt: Date;
}


export interface IChatReducer {
    chats: IChat[];
    selectedChatId: string | null;
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
        isMenuOpen: boolean;
        activeFilter: string;
    }
}

export interface IChatPage {
    uiState: {
        screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        activeView: 'sidebar' | 'chat' | 'details';
    };
}