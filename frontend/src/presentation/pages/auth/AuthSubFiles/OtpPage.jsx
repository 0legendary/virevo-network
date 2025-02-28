import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import axiosInstance from '../../../config/axiosConfig';
import { showToast } from '../../../Utils/toaster';
import LoadingPage from '../../AnimationPages/Loading/LoadingPage';
import './OtpPage.css'
const OtpPage = ({ payload }) => {
  const [state, setState] = useState({
    uiState: {
      otp: '',
      attemptsLeft: 5,
      isLoading: false,
      isSuccess: false,
      errors: ''
    }
  });

  const navigate = useNavigate();

  const updateState = (key, nestedKey, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        [nestedKey]: value,
      },
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4
      }
    }
  };

  const inputVariants = {
    focus: { scale: 1.05, borderColor: "#38bdf8" },
    blur: { scale: 1, borderColor: "rgba(255, 255, 255, 0.1)" }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98, y: 0 },
    success: {
      scale: [1, 1.1, 1],
      backgroundColor: ["#38bdf8", "#22c55e", "#22c55e"],
      transition: { duration: 0.5 }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!payload) {
        updateState('uiState', 'errors', 'Something went wrong, try again later')
        return;
      }

      if (state.uiState.attemptsLeft <= 0) {
        updateState('uiState', 'errors', 'You have reached the maximum attempts. Please try again later.')
        return;
      }

      updateState('uiState', 'isLoading', true);
      const response = await axiosInstance.post('/auth/verify-otp', {
        payload,
        otp: state.uiState.otp
      });

      if (response.data.status === true) {
        updateState('uiState', 'isSuccess', true);
        localStorage.setItem('accessToken', response.data.accessToken);
        showToast(response.data.message, 'success');

        setTimeout(() => {
          if (response.data.control === 'user') {
            navigate('/');
          } else {
            navigate('/admin');
          }
        }, 1000);
      } else {
        updateState('uiState', 'attemptsLeft', state.uiState.attemptsLeft - 1);
        updateState('uiState', 'errors', response.data.message)
      }
    } catch (error) {
      updateState('uiState', 'attemptsLeft', state.uiState.attemptsLeft - 1);
      updateState('uiState', 'errors', 'Something went wrong, try again later')
    } finally {
      updateState('uiState', 'isLoading', false);
    }
  };

  return (
    <div className="otp__container">
      {state.uiState.isLoading && <LoadingPage isBlurr={true} />}

      <motion.div
        className="otp__card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.h1
          className="otp__title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Enter Verification Code
        </motion.h1>

        <OtpInput
          value={state.uiState.otp}
          onChange={(value) => {
            updateState('uiState', 'otp', value);
            updateState('uiState', 'errors', '')
          }}
          numInputs={6}
          renderSeparator={<span style={{ width: '8px' }}></span>}
          renderInput={(props) => (
            <motion.input
              {...props}
              variants={inputVariants}
              whileFocus="focus"
              initial="blur"
              animate="blur"
            />
          )}
          containerStyle="otp__input-container"
          inputStyle="otp__input"
          shouldAutoFocus
          isInputNum
        />

        <motion.button
          className="otp__submit-button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          animate={state.uiState.isSuccess ? "success" : "idle"}
          onClick={handleSubmit}
          disabled={state.uiState.otp.length !== 6 || state.uiState.attemptsLeft <= 0 || state.uiState.isLoading}
        >
          <AnimatePresence mode="wait">
            {state.uiState.isLoading ? (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader size={24} />
                </motion.div>
                Verifying...
              </div>
            ) : state.uiState.isSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <CheckCircle2 size={20} />
                Verified!
              </motion.span>
            ) : (
              <motion.span
                key="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Verify Code
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.p
          className={`otp__attempts ${state.uiState.attemptsLeft <= 2 ? 'otp__attempts--warning' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {state.uiState.attemptsLeft > 0 ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              {state.uiState.attemptsLeft <= 2 && <AlertCircle size={16} />}
              {state.uiState.attemptsLeft} attempts remaining
            </span>
          ) : (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <AlertCircle size={16} />
              No more attempts left. Please try again later.
            </span>
          )}
          <AnimatePresence>
            {state.uiState?.errors.length > 0 && (
              <motion.div
                className="auth__error-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {state.uiState.errors}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OtpPage;