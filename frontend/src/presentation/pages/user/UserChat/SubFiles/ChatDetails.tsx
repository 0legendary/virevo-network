import { Users } from "lucide-react"
import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { RootState } from "@/infrastructure/redux/store";

function ChatDetails() {
  const Chat = useSelector((state: RootState) => state.chat);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-199 max-h-199 my-bg"
    >
      <div className="relative w-full h-full shadow-xl my-bg my-border overflow-y-auto">
        <div className="p-4">
          {Chat.selectedChat ? (
            <div className="mt-8 flex flex-col items-center">
              {/* Chat Image - Group Image or Other Person's Image */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl ${
                  Chat.selectedChat.isPrivate ? "bg-blue-500" : "bg-purple-500"
                } text-white`}
              >
                {Chat.selectedChat.groupPic ? (
                  <img
                    src={Chat.selectedChat.groupPic}
                    alt="Group"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : Chat.selectedChat.isPrivate &&
                  Chat.selectedChat.participants.length > 1 &&
                  Chat.selectedChat.participants[1]?.profilePic ? (
                  <img
                    src={Chat.selectedChat.participants[1].profilePic}
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users size={40} />
                )}
              </div>

              {/* Chat Name */}
              <div className="mt-4 text-xl font-bold">
                {Chat.selectedChat.isPrivate
                  ? Chat.selectedChat.participants[1]?.name || "Unknown User"
                  : Chat.selectedChat.groupName || "Group Chat"}
              </div>

              {/* Contact Information */}
              {Chat.selectedChat.isPrivate ? (
                <div className="mt-2 text-sm opacity-75">
                  {Chat.selectedChat.participants[1]?.email || "No email"}
                </div>
              ) : (
                <div className="mt-2 text-sm opacity-75">
                  {Chat.selectedChat.participants.length} members
                </div>
              )}

              {/* About Section */}
              <div className="mt-6 w-full">
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-sm opacity-75">
                  {Chat.selectedChat.isPrivate
                    ? "Available for chat from 9am-5pm EST weekdays."
                    : "Group created to discuss the upcoming project deliverables and timelines."}
                </p>
              </div>

              {/* Members Section (Only for Groups) */}
              {!Chat.selectedChat.isPrivate && (
                <div className="mt-6 w-full">
                  <h3 className="font-medium mb-2">Members</h3>
                  <div className="max-h-40 overflow-y-auto">
                    {Chat.selectedChat.participants.map((member, i) => (
                      <div key={member._id} className="flex items-center py-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500", "bg-pink-500"][i % 6]
                          } text-white`}
                        >
                          {member.profilePic ? (
                            <img
                              src={member.profilePic}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>
                        <div className="ml-2">{member.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              Select a chat to view details
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatDetails
