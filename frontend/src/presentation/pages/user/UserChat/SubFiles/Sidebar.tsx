import { motion } from "framer-motion";
import { MoreVertical, MessageSquarePlus, Search, User, Check, CheckCheck } from "lucide-react";
import { useGlobalState } from "@/application/hooks/useGlobalState";
import { ChatType, IChat, IMessage, MessageType } from "@/domain/types/Chat";
import { useApi } from "@/application/hooks/useApi";
import { ApiResponse } from "@/domain/models/requestModel";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat, toggleNewConnection } from "@/infrastructure/redux/slices/chatSlice";
import { RootState } from "@/infrastructure/redux/store";
import { useEffect } from "react";
import { format } from "date-fns";

// Helper to generate mock ObjectId
export interface SideBarUIState {
  uiState: {
    isLoading: boolean;
    isMenuOpen: boolean;
    activeFilter: string;
  };
}

const Sidebar = () => {
  const chatData = useSelector((state: RootState) => state.chat);
  const currUser = useSelector((state: RootState) => state.auth.currUser);
  const dispatch = useDispatch()
  const { request: fetchChatsAndMessages } = useApi();

  const { state, updateState } = useGlobalState<SideBarUIState>({
    uiState: {
      isLoading: false,
      isMenuOpen: false,
      activeFilter: "All",
    },
  });

  const handleFetchChatsAndMessages = async () => {
    try {
      updateState('uiState', { isLoading: true });
      const dummyChats: IChat[] = [
        {
          _id: "6548fbb8d2a78c001c00a1c3",
          type: ChatType.GROUP,
          participants: [
            { _id: "6548fbb8d2a78c001c00a1a1", name: "Alice", email: "alice@example.com", profilePic: "alice.jpg" },
            { _id: "6548fbb8d2a78c001c00a1b2", name: "Bob", email: "bob@example.com", profilePic: "bob.jpg" },
          ],
          groupName: "Project Team",
          groupPic: null,
          isPrivate: false,
          isPremium: false,
          consultationFee: 0,
          backgroundImage: "background.jpg",
          createdAt: new Date("2025-03-07T12:00:00.000Z"),
          updatedAt: new Date("2025-03-07T14:00:00.000Z"),
          lastMessage: {
            content: "Hey team, let's start the meeting!",
            sender: { _id: "6548fbb8d2a78c001c00a1a1", name: "Alice", profilePic: "alice.jpg" },
            type: MessageType.TEXT,
            sentAt: new Date("2025-03-07T13:45:00.000Z"),
            deliveredAt: new Date("2025-03-07T13:46:00.000Z"),
            seenBy: [{ userId: "6548fbb8d2a78c001c00a1b2", seenAt: new Date("2024-03-07T13:47:00.000Z") }],
          },
        },
        {
          _id: "6548fcc0d2a78c001c00a1c4",
          type: ChatType.GROUP,
          participants: [
            { _id: "6548fcc0d2a78c001c00a1c5", name: "Charlie", email: "charlie@example.com", profilePic: "charlie.png" },
            { _id: "6548fcc0d2a78c001c00a1c6", name: "David", email: "david@example.com", profilePic: "david.png" },
            { _id: "6548fcc0d2a78c001c00a1c7", name: "Eve", email: "eve@example.com", profilePic: "eve.png" },
          ],
          groupName: "Book Club",
          groupPic: null,
          isPrivate: false,
          isPremium: false,
          consultationFee: 0,
          backgroundImage: "library_background.jpg",
          createdAt: new Date("2024-03-07T14:30:00.000Z"),
          updatedAt: new Date("2024-03-07T15:15:00.000Z"),
          lastMessage: {
            content: "Has everyone finished reading the chapter?",
            sender: { _id: "6548fcc0d2a78c001c00a1c5", name: "Charlie", profilePic: "charlie.png" },
            type: MessageType.TEXT,
            sentAt: new Date("2024-03-07T15:10:00.000Z"),
            deliveredAt: new Date("2024-03-07T15:11:00.000Z"),
            seenBy: [
              { userId: "6548fcc0d2a78c001c00a1c6", seenAt: new Date("2024-03-07T15:12:00.000Z") },
              { userId: "6548fcc0d2a78c001c00a1c7", seenAt: new Date("2024-03-07T15:13:00.000Z") },
            ],
          },
        },
        {
          _id: "6548fcd0d2a78c001c00a1c8",
          type: ChatType.PRIVATE,
          participants: [
            { _id: "6548fcd0d2a78c001c00a1c9", name: "Frank", email: "frank@example.com", profilePic: null },
            { _id: "6548fcd0d2a78c001c00a1ca", name: "Grace", email: "grace@example.com", profilePic: null },
          ],
          isPrivate: true,
          isPremium: false,
          consultationFee: 0,
          createdAt: new Date("2024-03-07T15:30:00.000Z"),
          updatedAt: new Date("2024-03-07T16:00:00.000Z"),
          lastMessage: {
            content: "Just checking in!",
            sender: { _id: "6548fcd0d2a78c001c00a1c9", name: "Frank", profilePic: "frank.jpeg" },
            type: MessageType.TEXT,
            sentAt: new Date("2024-03-07T15:55:00.000Z"),
            deliveredAt: new Date("2024-03-07T15:56:00.000Z"),
            seenBy: [{ userId: "6548fcd0d2a78c001c00a1ca", seenAt: new Date("2024-03-07T15:57:00.000Z") }],
          },
        },
        {
          _id: "6548fce0d2a78c001c00a1cb",
          type: ChatType.PRIVATE,
          participants: [
            { _id: "6548fce0d2a78c001c00a1cc", name: "Henry", email: "henry@example.com", profilePic: null },
            { _id: "6548fce0d2a78c001c00a1cd", name: "Ivy", email: "ivy@example.com", profilePic: null },
          ],
          isPrivate: true,
          isPremium: false,
          consultationFee: 0,
          createdAt: new Date("2024-03-07T16:30:00.000Z"),
          updatedAt: new Date("2024-03-07T17:00:00.000Z"),
          lastMessage: {
            content: "See you later!",
            sender: { _id: "6548fce0d2a78c001c00a1cc", name: "Henry", profilePic: "henry.png" },
            type: MessageType.TEXT,
            sentAt: new Date("2024-03-07T16:55:00.000Z"),
            deliveredAt: new Date("2024-03-07T16:56:00.000Z"),
            seenBy: [{ userId: "6548fce0d2a78c001c00a1cd", seenAt: new Date("2024-03-07T16:57:00.000Z") }],
          },
        },
      ]
      // const response = await fetchChatsAndMessages('get', 'user/chats');
      // const { success, message, data } = response as ApiResponse;
      dispatch(setChats(dummyChats))
      updateState('uiState', { isLoading: false })
    } catch (error: any) {
      console.error("Error fetching chats and messages:", error.message);
    }
  }

  useEffect(() => {
    handleFetchChatsAndMessages()
  }, [])


  const formatTimestamp = (date: any) => {
    const now = new Date();
    const sentDate = new Date(date);

    const isToday = sentDate.toDateString() === now.toDateString();
    const isYesterday = sentDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
    const isThisWeek = sentDate > new Date(now.setDate(now.getDate() - 6));

    if (isToday) return format(sentDate, "hh:mm a");
    if (isYesterday) return "Yesterday";
    if (isThisWeek) return format(sentDate, "EEEE"); // Monday, Tuesday, etc.
    return format(sentDate, "dd/MM/yyyy");
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{ type: "keyframes", stiffness: 100 }}
      className="shadow-lg flex flex-col my-bg my-text min-h-199 max-h-199"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b my-border">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex gap-3">
          <div onClick={() => dispatch(toggleNewConnection(!chatData.isNewConnectOpen))}>
            <MessageSquarePlus className="w-6 h-6 cursor-pointer my-text" />
          </div>
          <div className="relative">
            <MoreVertical
              className="w-6 h-6 cursor-pointer my-text"
              onClick={() => updateState("uiState", { isMenuOpen: !state.uiState.isMenuOpen })}
            />
            {state.uiState.isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 shadow-lg rounded-lg overflow-hidden my-bg-secondary my-text"
              >
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">New Group</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">Starred Messages</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="flex items-center p-2 rounded-lg  my-bg-secondary my-text">
          <Search className="w-5 h-5 my-text" />
          <input type="text" placeholder="Search chats" className="ml-2 w-full bg-transparent focus:outline-none my-text" />
        </div>
      </div>

      {/* Filter Options */}
      {!chatData.isNewConnectOpen && (
      <div className="flex gap-2 px-3">
        {["All", "Unread", "Fav", "Groups"].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1 text-sm rounded-lg cursor-pointer hover:bg-gray-400 my-text ${state.uiState.activeFilter === filter ? "dark:bg-blue-950 bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`}
            onClick={() => updateState("uiState", { activeFilter: filter })}
          >
            {filter}
          </button>
        ))}
      </div>
      )}

      {/* Chat List */}
      {!chatData.isNewConnectOpen && (
        <div className="flex-1 overflow-y-auto p-2 my-text">
          {chatData.chats.map((chat) => {
            const isGroup = !chat.isPrivate;
            const otherParticipant = chat.participants.find(p => p._id !== currUser?._id);
            const displayName = isGroup ? chat.groupName : otherParticipant?.name;
            const displayPic = isGroup ? chat.groupPic : otherParticipant?.profilePic;

            const lastMessage = chat.lastMessage;
            const isSentByCurrentUser = lastMessage?.sender?._id === currUser?._id;

            let messageStatus = <Check size={14} className="ml-1" />; // Sent
            if (lastMessage?.deliveredAt)
              messageStatus =
                <div className="flex ml-1">
                  <CheckCheck size={14} />
                </div>
            if (lastMessage?.seenBy?.length)
              messageStatus =
                <div className="flex ml-1 text-blue-500">
                  <CheckCheck size={14} />
                </div>;

            return (
              <div key={chat._id} onClick={() => { dispatch(setSelectedChat(chat)) }} className="flex justify-between items-center p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex gap-3">
                  {displayPic ? (
                    <img src={displayPic} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 p-1.5 rounded-full my-bg-secondary" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold">{displayName}</h3>
                    <p className="text-xs flex items-center gap-1">
                      <span className={'message-status'}>{messageStatus}</span>
                      {lastMessage?.content}
                    </p>
                  </div>
                </div>
                <div className="text-xs">{formatTimestamp(lastMessage?.sentAt)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Group Modal */}
      {chatData.isNewConnectOpen && (
        <div className="flex-1 overflow-y-auto p-2 my-text">
          <div className="flex justify-between items-center p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex gap-3">
              <User className="w-10 h-10 p-1.5 rounded-full my-bg-secondary" />
              <h3 className="text-sm font-semibold flex items-center gap-1">New Chat</h3>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex gap-3">
              <User className="w-10 h-10 p-1.5 rounded-full my-bg-secondary" />
              <h3 className="text-sm font-semibold flex items-center gap-1">New Group</h3>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
