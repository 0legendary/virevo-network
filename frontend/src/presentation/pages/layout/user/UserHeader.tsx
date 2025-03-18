import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout, toggleTheme } from '../../../../infrastructure/redux/slices/authSlice';
import { RootState } from '../../../../infrastructure/redux/store';
import { Search, Bell, Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UserHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const theme = useSelector((state: RootState) => state.auth.theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);

  // Control header visibility on scroll
  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        // Hide header when scrolling down, show when scrolling up
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };
  const handleLogout = () => {
    dispatch(logout());
    dispatch(toggleTheme('light'))
    navigate('/auth');
  };


  return (
    <motion.header
      className="w-full z-10 right-0 bg-card-background shadow-md transition-colors duration-300"
      style={{
        backgroundColor: 'var(--card-background)',
        boxShadow: 'var(--box-shadow)',
        borderBottom: '1px solid var(--border)'
      }}
      initial={{ y: 0 }}
      animate={{ y: showHeader ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Name - Left side */}
          <div className="flex items-center">
            <motion.div
              className="flex-shrink-0 flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                A
              </div>
              <motion.span
                className="ml-2 text-lg font-semibold hidden sm:block uppercase"
                style={{ color: 'var(--text-primary)' }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Virevo
              </motion.span>
            </motion.div>
          </div>

          {/* Search Bar - Center (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <motion.div
              className="relative w-full max-w-md"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-2 transition-all duration-300 border-2 dark:border-neutral-700"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--input-shadow)'
                }}
              />
              <div className="absolute left-3 top-2.5">
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
            </motion.div>
          </div>

          {/* Right side items - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleToggleTheme}
              className="relative p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(75, 107, 253, 0.1)'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {theme === 'dark' ? (
                    <Moon size={20} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Sun size={20} style={{ color: 'var(--primary)' }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'rgba(75, 107, 253, 0.1)'
              }}
            >
              <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
              <motion.span
                className="absolute top-0 right-0 h-4 w-4 rounded-full bg-error flex items-center justify-center text-white text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                3
              </motion.span>
            </motion.button>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'rgba(75, 107, 253, 0.1)'
              }}
            >
              <User size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex gap-2 relative p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'rgba(75, 107, 253, 0.1)'
              }}
              onClick={handleLogout}
            >
              <LogOut size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md transition-all duration-300"
              style={{ color: 'var(--text-primary)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Search - Shown below header on mobile */}
      <div className="md:hidden px-4 pb-3">
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-2 transition-all duration-300"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--input-shadow)'
            }}
          />
          <div className="absolute left-3 top-2.5">
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden"
            style={{
              backgroundColor: 'var(--card-background)',
              borderTop: '1px solid var(--border)'
            }}
          >
            <div className="px-4 py-2 space-y-1">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Theme</span>
                <motion.button
                  onClick={handleToggleTheme}
                  className="p-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(75, 107, 253, 0.1)'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {theme === 'dark' ? (
                    <Moon size={20} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Sun size={20} style={{ color: 'var(--primary)' }} />
                  )}
                </motion.button>
              </div>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Notifications</span>
                <div className="relative">
                  <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                  <motion.span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error flex items-center justify-center text-white text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    3
                  </motion.span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span style={{ color: 'var(--text-primary)' }}>Profile</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                  Acc
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default UserHeader;