import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ArrowLeft, Info, X } from 'lucide-react';
import Sidebar from './SubFiles/Sidebar';
import ChatWindow from './SubFiles/ChatWindow';
import ChatDetails from './SubFiles/ChatDetails';

interface ChatPageProps {
  darkMode?: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ darkMode = false }) => {
  // State for UI components visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatDetailsOpen, setIsChatDetailsOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  const [activeView, setActiveView] = useState<'sidebar' | 'chat' | 'details'>('chat');

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else if (width < 1280) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    // Initial detection
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    if (screenSize === 'sm' || screenSize === 'md') {
      setActiveView('sidebar');
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Handle chat details toggle
  const toggleChatDetails = () => {
    if (screenSize === 'sm' || screenSize === 'md') {
      setActiveView('details');
    } else {
      setIsChatDetailsOpen(!isChatDetailsOpen);
    }
  };

  // Handle back navigation for mobile
  const handleBack = () => {
    setActiveView('chat');
  };

  // Determine if we're on mobile
  const isMobile = screenSize === 'sm' || screenSize === 'md';
  const isLargeScreen = screenSize === 'xl' || screenSize === '2xl';

  return (
    <div 
      className={`flex h-screen w-full overflow-hidden transition-colors duration-300 dark:bg-gray-900 text-white bg-gray-50 dark:text-gray-900`}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {((isLargeScreen || isSidebarOpen) && !isMobile) || (isMobile && activeView === 'sidebar') ? (
          <motion.div 
            className={`${isMobile ? 'fixed inset-0 z-20 w-full' : isLargeScreen ? 'w-100' : 'w-72'} h-full`}
            initial={{ x: isMobile ? -300 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -300 : -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={`flex h-full flex-col bg-white dark:bg-gray-800 shadow-lg`}>
              {isMobile && (
                <div className={`flex items-center h-16 px-4 border-b border-gray-700 dark:border-gray-200`}>
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
                <Sidebar/>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Chat Window */}
      <motion.div 
        className={`flex-1 flex flex-col ${
          isMobile && activeView !== 'chat' ? 'hidden' : 'block'
        }`}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Chat Header */}
        <div className={`flex items-center justify-between h-16 px-4 shadow-sm border-b dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200'`}>
          <div className="flex items-center">
            {(!isLargeScreen || isMobile) && (
              <button 
                onClick={toggleSidebar}
                className={`mr-3 rounded-full p-2 hover:bg-gray-700 dark:hover:bg-gray-100`}
              >
                <Menu size={20} />
              </button>
            )}
            <h2 className="text-lg font-semibold dark:text-white text-stone-800">Current Chat</h2>
          </div>
          <div className="flex items-center">
            <button 
              onClick={toggleChatDetails}
              className={`rounded-full p-2 hover:bg-gray-700 bg-gray-200 dark:bg-gray-700 ${isChatDetailsOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              aria-label="Chat Details"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
        
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ChatWindow/>
        </div>
      </motion.div>

      {/* Chat Details Side Panel */}
      <AnimatePresence>
        {((!isMobile && isChatDetailsOpen) || (isMobile && activeView === 'details')) && (
          <motion.div 
            className={`${isMobile ? 'fixed inset-0 z-20 w-full' : 'w-80'} h-full`}
            initial={{ x: isMobile ? 300 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 300 : 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={`flex h-full flex-col dark:bg-gray-800 bg-white shadow-lg`}>
              <div className={`flex items-center justify-between h-16 px-4 border-b dark:border-gray-700  border-gray-200`}>
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
                      onClick={toggleChatDetails}
                      className={`rounded-full p-2 hover:bg-gray-700 dark:hover:bg-gray-100`}>
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <ChatDetails/>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;