import { Users, X } from "lucide-react"
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/infrastructure/redux/store";
import { toggleChatDetails } from "@/infrastructure/redux/slices/chatSlice";

function ChatDetails() {
  const reduxState = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={'min-h-199 max-h-199 my-bg'}
    >
      <div className={`relative w-full h-full shadow-xl my-bg my-border overflow-y-auto`}>
        <div className="p-4">
          <div className="mt-8 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl ${false ? 'bg-blue-500' : 'bg-purple-500'} text-white`}>
              {/* {isGroupChat ? <Users size={40} /> : <User size={40} />} */}
              <Users size={40} />
            </div>

            <div className="mt-4 text-xl font-bold">
              {/* {isGroupChat ? "Project Discussion Group" : "Alice Cooper"} */}
              Project Discussion Group
            </div>

            {false ? (
              <div className="mt-2 text-sm opacity-75">
                {/* {groupMembers.length} members */}
              </div>
            ) : (
              <div className="mt-2 text-sm opacity-75">
                +1 (555) 123-4567
              </div>
            )}

            <div className="mt-6 w-full">
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-sm opacity-75">
                {false
                  ? "Group created to discuss the upcoming project deliverables and timelines."
                  : "Available for chat from 9am-5pm EST weekdays."}
              </p>
            </div>

            {false && (
              <div className="mt-6 w-full">
                <h3 className="font-medium mb-2">Members</h3>
                <div className="max-h-40 overflow-y-auto">
                  {['alen'].map((member, i) => (
                    <div key={i} className="flex items-center py-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'][i % 6]} text-white`}>
                        {member.charAt(0)}
                      </div>
                      <div className="ml-2">{member}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatDetails
