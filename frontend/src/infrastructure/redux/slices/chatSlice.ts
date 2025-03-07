import { IChat, IMessage } from '@/domain/types/Chat';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import mongoose from 'mongoose';

interface ChatState {
    chats: IChat[];
    selectedChatId: string | null;
    messages: Record<string, IMessage[]>; // Storing messages by chatId
    loading: boolean;
    error: string | null;
    isChatDetailsOpen: boolean;
}

const initialState: ChatState = {
    chats: [],
    selectedChatId: null,
    messages: {},
    loading: false,
    error: null,
    isChatDetailsOpen: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats(state, action: PayloadAction<IChat[]>) {
            state.chats = action.payload;
        },
        setSelectedChatId(state, action: PayloadAction<string | null>) {
            state.selectedChatId = action.payload;
        },
        setMessages(state, action: PayloadAction<{ chatId: mongoose.Types.ObjectId; messages: IMessage[] }>) {
            const chatIdStr = action.payload.chatId.toString();  // ✅ Convert ObjectId to string
            state.messages[chatIdStr] = action.payload.messages;
        },
        addMessage(state, action: PayloadAction<IMessage>) {
            const chatIdStr = action.payload.chatId.toString();
        
            // Ensure the chat exists in messages state
            if (!state.messages[chatIdStr]) {
                state.messages[chatIdStr] = [];
            }
        
            // Append the new message
            state.messages[chatIdStr] = [...state.messages[chatIdStr], action.payload];
        
            // Update sidebar last message
            const chatIndex = state.chats.findIndex(chat => chat._id.toString() === chatIdStr);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = action.payload.content;
            }
        },
        updateMessage(state, action: PayloadAction<IMessage>) {
            const chatIdStr = action.payload.chatId.toString();
            const messageIdStr = action.payload._id.toString();

            if (state.messages[chatIdStr]) {
                state.messages[chatIdStr] = state.messages[chatIdStr].map((msg) =>
                    msg._id.toString() === messageIdStr ? action.payload : msg
                );
            }
        },
        deleteMessage(state, action: PayloadAction<{ chatId: string; messageId: string }>) {
            const { chatId, messageId } = action.payload;
            if (state.messages[chatId]) {
                state.messages[chatId] = state.messages[chatId].filter((msg) => msg._id.toString() !== messageId);
            }
        },        
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        toggleChatDetails(state, action: PayloadAction<boolean>) {
            state.isChatDetailsOpen = action.payload;
        },
        setMessageSeen(state, action: PayloadAction<{ chatId: String; messageId: string; userId: string }>) {
            const chatIdStr = action.payload.chatId.toString();
            const messageIdStr = action.payload.messageId.toString();

            if (state.messages[chatIdStr]) {
                state.messages[chatIdStr] = state.messages[chatIdStr].map((msg) => {
                  const seenByList = msg.seenBy ?? [];
            
                  return msg._id.toString() === messageIdStr
                    ? {
                        ...msg,
                        seenBy: seenByList.includes(action.payload.userId)
                          ? seenByList
                          : [...seenByList, action.payload.userId],
                      }
                    : msg;
                });
              }
        },
    },
});

export const {
    setChats,
    setSelectedChatId,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setLoading,
    setError,
    toggleChatDetails,
    setMessageSeen,
} = chatSlice.actions;

export default chatSlice.reducer;
