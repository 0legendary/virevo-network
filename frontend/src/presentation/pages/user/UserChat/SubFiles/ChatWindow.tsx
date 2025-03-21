import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, Check, User, Camera, File, Users, BarChart2, MessageCircle, PlusCircle, CheckCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessages, toggleChatDetails, toggleNewConnection } from '@/infrastructure/redux/slices/chatSlice';
import { RootState } from '@/infrastructure/redux/store';
import { useGlobalState } from '@/application/hooks/useGlobalState';
import { IMessage, MessageType } from '@/domain/types/Chat';
import mongoose from 'mongoose';
import { emptyChatContainerVariants, itemVariants, pulseVariants } from '@/constants/design';
import { useApi } from '@/application/hooks/useApi';
import { ApiResponse } from '@/domain/models/requestModel';

// Mock data for demonstration
const mockMessages = [
  { id: 1, text: "Hey, how's it going?", sender: "them", senderName: "Alice", time: "09:30 AM", status: "seen", date: "Today" },
  { id: 2, text: "I'm good, thanks! How about you?", sender: "me", time: "09:32 AM", status: "seen", date: "Today" },
  { id: 3, text: "Pretty well. Did you finish the project?", sender: "them", senderName: "Alice", time: "09:33 AM", status: "seen", date: "Today" },
  { id: 4, text: "Yes, just submitted it this morning!", sender: "me", time: "09:35 AM", status: "delivered", date: "Today" },
  { id: 5, text: "That's great news!", sender: "them", senderName: "Alice", time: "09:36 AM", status: "delivered", date: "Today" },
];

interface IChatWindow {
  uiState: {
    inputMessage: string;
    attachmentMenuOpen: boolean;
    menuOpen: boolean;
    replyMessageId: string | null;
    isLoading: boolean;
  };
  data: {
    messages: any;
  }
}
const ChatWindow = () => {
  const { request: fetchChatMessagesApi } = useApi();

  const { state, updateState } = useGlobalState<IChatWindow>({
    uiState: {
      inputMessage: "",
      attachmentMenuOpen: false,
      menuOpen: false,
      replyMessageId: null,
      isLoading:false,
    },
    data: {
      messages: mockMessages
    }
  });
  const chatDetails = useSelector((state: RootState) => state.chat);
  const currUser = useSelector((state: RootState) => state.auth.currUser);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (chatDetails.selectedChat) {
      fetchChatMessages(chatDetails.selectedChat._id);
    }
  }, [chatDetails.selectedChat]);

  const fetchChatMessages = async (chatId: string) => {
    try {
      updateState('uiState', { isLoading: true })
      const response = await fetchChatMessagesApi('get', `/chat/messages/${chatId}`);
      const { success, message, data } = response as ApiResponse;
      if (!success) throw new Error(message);
      dispatch(setMessages({chatId, messages: data}))
    } catch (error: any) {
      console.error("Error fetching messages", error);
    }finally{
      updateState('uiState', { isLoading: false })
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef(null);

  // // // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.data.messages]);

  // Send message handler
  const handleSendMessage = () => {
    if (state.uiState.inputMessage.trim() === "") return;

    if (!currUser || !currUser._id) {
      console.error("Current user is null. Cannot send message.");
      return;
    }

    if (!chatDetails.selectedChat) {
      console.error("Chat ID is null. Cannot send message.");
      return;
    }
    const newMessage: IMessage = {
      _id: new mongoose.Types.ObjectId().toString(),
      chatId: chatDetails.selectedChat._id.toString(), // Ensure this is set from context/state
      sender: { _id: currUser?._id, name: currUser?.name, profilePic: currUser?.profilePic }, // Ensure currentUser is available
      type: MessageType.TEXT, // Default type, change for media messages
      content: state.uiState.inputMessage, // User input
      mediaUrl: undefined, // Set if sending an image, video, etc.
      reactions: [], // Empty array by default
      replyTo: state.uiState.replyMessageId ? state.uiState.replyMessageId.toString() : null,
      scheduledAt: null, // Set if scheduling a message
      autoDeleteAt: null, // Set if message should auto-delete
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch(addMessage(newMessage));

    // Send message to backend via WebSocket
    // socket.emit("sendMessage", newMessage);

    updateState("uiState", { inputMessage: "" })
    updateState("data", { messages: [...state.data.messages, newMessage] })
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render message status icons
  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="ml-1" />;
      case 'delivered':
        return (
          <div className="flex ml-1">
            <CheckCheck size={14} />
          </div>
        );
      case 'seen':
        return (
          <div className="flex ml-1 text-blue-500">
            <CheckCheck size={14} />
          </div>
        );
      default:
        return null;
    }
  };
  const getProfilePic = () => {
    const chat = chatDetails.selectedChat;

    if (!chat) return null;

    if (chat.isPrivate) {
      // Private chat - Get receiver's profile picture
      const receiver = chat.participants.find(p => p._id !== currUser?._id);
      return receiver?.profilePic ? (
        <img src={receiver.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      );
    } else {
      // Group chat - Use groupPic if available
      return chat.groupPic ? (
        <img src={chat.groupPic} alt="Group" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      );
    }
  };


  return (
    <div className={`flex min-h-199 max-h-199 flex-col max-w-full mx-auto border rounded-lg shadow-lg overflow-hidden my-bg my-text`}>
      {chatDetails.selectedChat ? (
        <>
          {/* Chat Header */}
          <div
            className="flex items-center p-4 border-b my-bg my-border"
            onClick={() => dispatch(toggleChatDetails(!chatDetails.isChatDetailsOpen))}
          >
            <div className="relative cursor-pointer">
              {getProfilePic()}
              {/* Online status indicator (optional, can be dynamic later) */}
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            <div className="ml-3 flex-1">
              <div className="font-semibold">
                {/* Show Group Name if it's a group, else show receiver's name */}
                {chatDetails.selectedChat.isPrivate
                  ? chatDetails.selectedChat.participants.find(p => p._id !== currUser?._id)?.name
                  : chatDetails.selectedChat.groupName}
              </div>
              <div className="text-xs opacity-75">
                {/* Show group members list or active status */}
                {!chatDetails.selectedChat.isPrivate
                  ? chatDetails.selectedChat.participants.slice(0, 3).map(p => p.name).join(", ") +
                  (chatDetails.selectedChat.participants.length > 3 ? ` and ${chatDetails.selectedChat.participants.length - 3} more` : "")
                  : "Active now"}
              </div>
            </div>

            <div className="flex items-center">
              <button className="p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200">
                <Search size={20} />
              </button>
              <div className="relative">
                <button
                  className="p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateState("uiState", { menuOpen: !state.uiState.menuOpen });
                  }}
                >
                  <MoreVertical size={20} />
                </button>

                {/* Header Menu Dropdown */}
                <AnimatePresence>
                  {state.uiState.menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg z-50 my-bg-secondary my-border border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        {["Contact Info", "Select Message", "Mute Notifications", "Disappearing Message", "Add to Favorite", "Close Chat", "Report", "Block", "Clear Chat", "Delete Chat", "Toggle Theme"].map((option, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 text-sm cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-100"
                            onClick={() => updateState("uiState", { menuOpen: false })}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>


          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className={'flex-1 p-4 overflow-y-auto my-bg scrollbar-thin'}
          >
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <div className={'px-4 py-1 rounded-full text-xs my-bg-secondary'}>
                Today
              </div>
            </div>

            {/* Messages */}
            {state.data.messages.map((message: any) => {
              const isMe = message.sender === "me";
              const showSenderName = !isMe && true;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}
                >
                  <div
                    className={`relative max-w-xs lg:max-w-md rounded-lg px-4 py-2 
                ${isMe
                        ? 'dark:bg-green-900 bg-green-800 text-white'
                        : 'dark:bg-gray-800 bg-white dark:text-white text-gray-800'} 
                shadow`}
                  >
                    {showSenderName && (
                      <div className="text-xs font-medium text-blue-400 mb-1">
                        {message.senderName}
                      </div>
                    )}

                    {/* Message text */}
                    <div>{message.text}</div>

                    {/* Time and status */}
                    <div className={`text-xs mt-1 flex justify-end items-center 
                  ${isMe ? 'text-blue-200' : 'dark:text-gray-400 text-gray-500'}`}
                    >
                      {message.time}
                      {isMe && renderMessageStatus(message.status)}
                    </div>

                    {/* Emoji reaction button (shown on hover) */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className={`absolute -top-3 ${isMe ? 'left-0' : 'right-0'} bg-white text-gray-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Smile size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className={'p-4 border-t my-bg my-border'}>
            <div className="flex items-center">
              {/* Attachment button */}
              <div className="relative">
                <button
                  className={'p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200'}
                  onClick={() => updateState("uiState", { attachmentMenuOpen: !state.uiState.attachmentMenuOpen })}
                >
                  <Paperclip size={20} />
                </button>

                {/* Attachment menu dropdown */}
                <AnimatePresence>
                  {state.uiState.attachmentMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={'absolute bottom-full left-0 mb-2 rounded-md shadow-lg z-10 my-bg my-border border'}
                    >
                      <div className="py-1">
                        {[
                          { name: "Document", icon: <File size={16} /> },
                          { name: "Photos & Videos", icon: <Camera size={16} /> },
                          { name: "Camera", icon: <Camera size={16} /> },
                          { name: "Contact", icon: <User size={16} /> },
                          { name: "Poll", icon: <BarChart2 size={16} /> }
                        ].map((option, i) => (
                          <div
                            key={i}
                            className={'px-4 py-2 text-sm cursor-pointer flex items-center dark:hover:bg-gray-700 hover:bg-gray-100'}
                            onClick={() => updateState("uiState", { attachmentMenuOpen: false })}
                          >
                            <span className="mr-2">{option.icon}</span>
                            {option.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message input */}
              <div className={'flex-1 mx-2 rounded-full overflow-hidden my-bg-secondary'}>
                <textarea
                  rows={1}
                  value={state.uiState.inputMessage}
                  onChange={(e) => updateState("uiState", { inputMessage: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className={`w-full px-7 py-3 outline-none resize-none my-bg-secondary my-text`}
                />
              </div>

              {/* Emoji button */}
              <button className={'p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200'}>
                <Smile size={20} />
              </button>

              {/* Send/Mic button */}
              <button
                className={`p-2 rounded-full ${state.uiState.inputMessage.trim() ? 'bg-blue-500 text-white' : 'dark:hover:bg-gray-700 hover:bg-gray-200'}`}
                onClick={handleSendMessage}
              >
                {state.uiState.inputMessage.trim() ? <Send size={20} /> : <Mic size={20} />}
              </button>
            </div>
          </div>
        </>
      ) :
        <motion.div
          className={`flex min-h-[calc(100vh-4rem)] md:min-h-199 max-h-[calc(100vh-4rem)] md:max-h-199 flex-col w-full mx-auto border rounded-lg shadow-lg overflow-hidden my-bg my-text dark:border-gray-700 dark:shadow-gray-800`}
          variants={emptyChatContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 sm:p-6 md:p-10 lg:p-12">
            {/* Icon Container */}
            <motion.div
              variants={itemVariants}
              className="relative mb-6 md:mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-4 sm:p-5 md:p-6 rounded-full bg-opacity-10 bg-gray-500 dark:bg-opacity-20 dark:bg-gray-400 transition-all duration-300">
                <MessageCircle
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-600 dark:text-gray-300"
                  strokeWidth={1.5}
                />
              </div>
              {/* Enhanced pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gray-500 dark:bg-gray-400 bg-opacity-5"
                variants={pulseVariants}
                animate="animate"
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-gray-500 dark:bg-gray-400 bg-opacity-3"
                variants={pulseVariants}
                animate="animate"
                transition={{ delay: 0.5 }}
              />
            </motion.div>

            {/* Main Message */}
            <motion.h2
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-gray-800 dark:text-gray-200"
              whileHover={{ x: 2 }}
            >
              No Chat Selected
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-xs sm:max-w-md md:max-w-lg mb-6 md:mb-8"
            >
              Start a new conversation or select an existing one from the sidebar to begin chatting.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6"
            >
              <motion.button
                className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 text-sm md:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                disabled={chatDetails.isNewConnectOpen}
                onClick={() => dispatch(toggleNewConnection(!chatDetails.isNewConnectOpen))}
              >
                <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                New Chat
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-sm md:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                View Contacts
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      }

    </div>
  );
};

export default ChatWindow;