import { motion } from "framer-motion";
import { MoreVertical, MessageSquarePlus, Search, User } from "lucide-react";
import { useGlobalState } from "@/application/hooks/useGlobalState";
import { SideBarUIState } from "@/domain/types/Chat";

const Sidebar = () => {
  const { state, updateState } = useGlobalState<SideBarUIState>({
    uiState: {
      isMenuOpen: false,
      activeFilter: "All",
    },
  });


  const chats = [
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "12:30 PM", unread: true },
    { id: 2, name: "Project Team", lastMessage: "Alice: Let's meet at 3 PM", time: "Yesterday", unread: false },
    { id: 3, name: "Mom", lastMessage: "Dinner at 7?", time: "14/02/2024", unread: true },
  ];

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{ type: "keyframes", stiffness: 100 }}
      className="h-screen shadow-lg flex flex-col my-bg my-text"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b my-border">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex gap-3">
          <MessageSquarePlus className="w-6 h-6 cursor-pointer my-text"          />
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
          <Search className="w-5 h-5 my-text"/>
          <input type="text" placeholder="Search chats" className="ml-2 w-full bg-transparent focus:outline-none my-text"/>
        </div>
      </div>

      {/* Filter Options */}
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

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 my-text">
        {chats.map((chat) => (
          <div key={chat.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex gap-3">
              <User className="w-10 h-10 p-1.5 rounded-full my-bg-secondary"/>
              <div>
                <h3 className="text-sm font-semibold">{chat.name}</h3>
                <p className="text-xs">{chat.lastMessage}</p>
              </div>
            </div>
            <div className="text-xs ">{chat.time}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
