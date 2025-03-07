import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, Check, User, Camera, File, Users, BarChart2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, toggleChatDetails } from '@/infrastructure/redux/slices/chatSlice';
import { RootState } from '@/infrastructure/redux/store';
import { useGlobalState } from '@/application/hooks/useGlobalState';
import { IMessage, MessageType } from '@/domain/types/Chat';
import mongoose from 'mongoose';

// Mock data for demonstration
const mockMessages = [
  { id: 1, text: "Hey, how's it going?", sender: "them", senderName: "Alice", time: "09:30 AM", status: "seen", date: "Today" },
  { id: 2, text: "I'm good, thanks! How about you?", sender: "me", time: "09:32 AM", status: "seen", date: "Today" },
  { id: 3, text: "Pretty well. Did you finish the project?", sender: "them", senderName: "Alice", time: "09:33 AM", status: "seen", date: "Today" },
  { id: 4, text: "Yes, just submitted it this morning!", sender: "me", time: "09:35 AM", status: "delivered", date: "Today" },
  { id: 5, text: "That's great news!", sender: "them", senderName: "Alice", time: "09:36 AM", status: "delivered", date: "Today" },
];

// Sample group members
const groupMembers = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank"];
interface IChatWindow {
  uiState: {
    inputMessage: string;
    attachmentMenuOpen: boolean;
    menuOpen: boolean;
    replyMessageId:string | null;
  };
  data: {
    messages: any;
  }
}
const ChatWindow = () => {
  const { state, updateState } = useGlobalState<IChatWindow>({
    uiState: {
      inputMessage: "",
      attachmentMenuOpen: false,
      menuOpen: false,
      replyMessageId: null,
    },
    data: {
      messages: mockMessages
    }
  });


  const chatDetails = useSelector((state: RootState) => state.chat);
  const currUser = useSelector((state: RootState) => state.auth.currUser);
  const dispatch = useDispatch();

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // // // Auto-scroll to bottom on new messages
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // Send message handler
  const handleSendMessage = () => {
    if (state.uiState.inputMessage.trim() === "") return;

    if (!currUser || !currUser._id) {
      console.error("Current user is null. Cannot send message.");
      return;
    }
    
    if (!chatDetails.selectedChatId) {
      console.error("Chat ID is null. Cannot send message.");
      return;
    }
    const newMessage: IMessage = {
      _id: new mongoose.Types.ObjectId().toString(),
      chatId: chatDetails.selectedChatId.toString(), // Ensure this is set from context/state
      sender: currUser?._id, // Ensure currentUser is available
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
            <Check size={14} />
            <Check size={14} className="-ml-1" />
          </div>
        );
      case 'seen':
        return (
          <div className="flex ml-1 text-blue-500">
            <Check size={14} />
            <Check size={14} className="-ml-1" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex min-h-199 max-h-199 flex-col max-w-full mx-auto border rounded-lg shadow-lg overflow-hidden my-bg my-text`}>
      {/* Chat Header */}
      <div
        className={`flex items-center p-4 border-b my-bg my-border`}
        onClick={() => dispatch(toggleChatDetails(!chatDetails.isChatDetailsOpen))}
      >
        <div className="relative cursor-pointer">
          {true ? (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
          )}
          <div className={'absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500'}></div>
        </div>

        <div className="ml-3 flex-1">
          <div className="font-semibold">{false ? "Project Discussion Group" : "Alice Cooper"}</div>
          <div className="text-xs opacity-75">
            {true
              ? groupMembers.slice(0, 3).join(", ") + (groupMembers.length > 3 ? ` and ${groupMembers.length - 3} more` : "")
              : "Active now"
            }
          </div>
        </div>

        <div className="flex items-center">
          <button className={'p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200'}>
            <Search size={20} />
          </button>
          <div className="relative">
            <button
              className={'p-2 rounded-full dark:hover:bg-gray-700 hover:bg-gray-200'}
              onClick={(e) => { e.stopPropagation(); updateState("uiState", { menuOpen: !state.uiState.menuOpen }); }}
            >
              <MoreVertical size={20} />
            </button>
            {/* Header menu dropdown */}
            <AnimatePresence>
              {state.uiState.menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={'absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg z-50 my-bg-secondary my-border border'}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {["Contact Info", "Select Message", "Mute Notifications", "Disappearing Message", "Add to Favorite", "Close Chat", "Report", "Block", "Clear Chat", "Delete Chat", "Toggle Theme"].map((option, i) => (
                      <div
                        key={i}
                        className={'px-4 py-2 text-sm cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-100'}
                        onClick={() => { updateState("uiState", { menuOpen: false }); }}
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
                    ? 'dark:bg-blue-600 bg-blue-500 text-white'
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
    </div >
  );
};

export default ChatWindow;