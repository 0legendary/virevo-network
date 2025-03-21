import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import Sidebar from './SubFiles/Sidebar';
import ChatWindow from './SubFiles/ChatWindow';
import ChatDetails from './SubFiles/ChatDetails';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/redux/store';
import { toggleChatDetails } from '@/infrastructure/redux/slices/chatSlice';
import { useGlobalState } from '@/application/hooks/useGlobalState';
import { IChatPage } from '@/domain/types/Chat';

const ChatPage = () => {
  const { state, updateState } = useGlobalState<IChatPage>({
    uiState: {
      screenSize: 'lg',
      activeView: 'chat',
    }
  });
  const isChatDetailsOpen = useSelector((state: RootState) => state.chat.isChatDetailsOpen);
  const dispatch = useDispatch();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) updateState("uiState", { screenSize: 'sm' })
      else if (width < 768) updateState("uiState", { screenSize: 'md' })
      else if (width < 1024) updateState("uiState", { screenSize: 'lg' })
      else if (width < 1280) updateState("uiState", { screenSize: 'xl' });
      else updateState("uiState", { screenSize: '2xl' });
    };

    // Initial detection
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Handle chat details toggle
  const handleToggleChatDetails = () => {
    if (state.uiState.screenSize === 'sm' || state.uiState.screenSize === 'md') {
      updateState("uiState", { activeView: 'details' })
    } else {
      dispatch(toggleChatDetails(!isChatDetailsOpen))
    }
  };

  // Handle back navigation for mobile
  const handleBack = () => {
    updateState("uiState", { activeView: 'chat' })
  };

  // Determine if we're on mobile
  const isMobile = state.uiState.screenSize === 'sm' || state.uiState.screenSize === 'md';
  const isLargeScreen = state.uiState.screenSize === 'xl' || state.uiState.screenSize === '2xl';

  return (
    <div
      className={`flex h-full w-full overflow-hidden transition-colors duration-300 dark:bg-gray-900 text-white bg-gray-50 dark:text-gray-900`}>
      {/* Sidebar */}
      <AnimatePresence>
        {(isLargeScreen && !isMobile) || (isMobile && state.uiState.activeView === 'sidebar') ? (
          <motion.div
            className={`${isMobile ? 'fixed inset-0 z-20 w-full' : isLargeScreen ? 'w-100' : 'w-72'} h-full`}
            initial={{ x: isMobile ? -300 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -300 : -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={`flex flex-col my-bg shadow-lg`}>
              {isMobile && (
                <div className={`flex items-center h-16 px-4 border-b my-border`}>
                  <button
                    onClick={handleBack}
                    className={`mr-3 rounded-full p-2 dark:hover:bg-gray-700 hover:bg-gray-100`}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold">Conversations</h2>
                </div>
              )}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <Sidebar />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Chat Window */}
      <motion.div
        className={`flex-1 flex flex-col ${isMobile && state.uiState.activeView !== 'chat' ? 'hidden' : 'block'}`}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin ">
          <ChatWindow />
        </div>
      </motion.div>
      {/* Chat Details Side Panel */}
      <AnimatePresence>
        {((!isMobile && isChatDetailsOpen) || (isMobile && state.uiState.activeView === 'details')) && (
          <motion.div
            className={`${isMobile ? 'fixed inset-0 z-20 w-full' : 'w-100'} my-text`}
            initial={{ x: isMobile ? 300 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 300 : 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={`flex flex-col my-bg shadow-lg`}>
              <div className={`flex items-center justify-between p-4 px-4 border-b my-border`}>
                {isMobile ? (
                  <div className="flex items-center">
                    <button
                      onClick={handleBack}
                      className={`mr-3 rounded-full p-2 hover:bg-gray-700 dark:hover:bg-gray-100`}>
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Chat Details</h2>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">Chat Details</h2>
                    <button
                      onClick={handleToggleChatDetails}
                      className={`rounded-full p-2 dark:hover:bg-gray-700 hover:bg-gray-100`}>
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin ">
                <ChatDetails />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;