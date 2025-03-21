import { IChat, IMessage } from '@/domain/types/Chat';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    chats: IChat[];
    selectedChat: IChat | null;
    messages: Record<string, IMessage[]>;
    loading: boolean;
    error: string | null;
    isChatDetailsOpen: boolean;
    isNewConnectOpen: boolean;
}

const initialState: ChatState = {
    chats: [],
    selectedChat: null,
    messages: {},
    loading: false,
    error: null,
    isChatDetailsOpen: false,
    isNewConnectOpen: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats(state, action: PayloadAction<IChat[]>) {
            state.chats = action.payload;
        },
        setSelectedChat(state, action: PayloadAction<IChat | null>) {
            state.selectedChat = action.payload;
        },
        setMessages(state, action: PayloadAction<{ chatId: string; messages: IMessage[] }>) {
            state.messages[action.payload.chatId] = action.payload.messages;
        },
        addMessage(state, action: PayloadAction<IMessage>) {
            const chatIdStr = action.payload.chatId.toString();
        
            // Ensure the chat exists in messages state
            if (!state.messages[chatIdStr]) {
                state.messages[chatIdStr] = [];
            }
        
            // Append the new message
            state.messages[chatIdStr] = [...state.messages[chatIdStr], action.payload];
            // // Update sidebar last message
            // const chatIndex = state.chats.findIndex(chat => chat._id.toString() === chatIdStr);
            // if (chatIndex !== -1) {
            //     state.chats[chatIndex].lastMessage = action.payload.content;
            // }
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
        toggleNewConnection(state, action: PayloadAction<boolean>) {
            state.isNewConnectOpen = action.payload;
        },
        setMessageSeen(state, action: PayloadAction<{ chatId: String; messageId: string; userId: string }>) {
            // const chatIdStr = action.payload.chatId.toString();
            // const messageIdStr = action.payload.messageId.toString();

            // if (state.messages[chatIdStr]) {
            //     state.messages[chatIdStr] = state.messages[chatIdStr].map((msg) => {
            //       const seenByList = msg.seenBy ?? [];
            
            //       return msg._id.toString() === messageIdStr
            //         ? {
            //             ...msg,
            //             seenBy: seenByList.includes(action.payload.userId)
            //               ? seenByList
            //               : [...seenByList, action.payload.userId],
            //           }
            //         : msg;
            //     });
            //   }
        },
    },
});

export const {
    setChats,
    setSelectedChat,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setLoading,
    setError,
    toggleChatDetails,
    setMessageSeen,
    toggleNewConnection,
} = chatSlice.actions;

export default chatSlice.reducer;
