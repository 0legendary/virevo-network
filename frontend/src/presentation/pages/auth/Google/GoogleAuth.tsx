import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { ApiResponse } from '../../../../domain/models/requestModel';
import { useApi } from '@/application/hooks/useApi';
import React from 'react';
import { AuthResponse, AuthState } from '@/domain/types/Authentication';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants } from '@/constants/design';
import axios from 'axios';

interface GoogleAuthProps {
  updateState: <K extends keyof AuthState>(key: K, value: Partial<AuthState[K]>) => void;
  handleAuthSuccess: (data: AuthResponse) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ updateState, handleAuthSuccess }) => {
  const { request: googleAuthentication } = useApi();

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        updateState("uiState", { error: { verifyError: "Google login failed. Please try again." } });
        return;
      }

      try {
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const res = await googleAuthentication("post", "/auth/google", { userInfo: userInfo.data });

        const { success, message, data } = res as ApiResponse;
        if (!success) {
          updateState("uiState", { error: { verifyError: message } });
          return;
        }

        updateState("uiState", { isVerified: true, signInStep: 6,  step: 5 });
        setTimeout(() => {
          updateState("uiState", { error: {} });
          handleAuthSuccess(data);
        }, 3000);
      } catch (error) {
        console.error("API request failed:", error);
        updateState("uiState", { error: { verifyError: "Something went wrong. Please try again." } });
      } finally {
        updateState("uiState", { isLoading: false });
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      updateState("uiState", { error: { verifyError: "Google sign-in failed. Try again later" } });
      updateState("uiState", { isLoading: false });
    },
  });

  return (
    <AnimatePresence mode="wait">
      <motion.button
        variants={itemVariants}
        type='button'
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => login()}
        className="flex items-center justify-center gap-2 hover:bg-white my-bg my-text my-border px-4 py-2 rounded-md border shadow w-full"
      >
        <FaGoogle className="text-red-500" />
        <span>Google</span>
      </motion.button>
    </AnimatePresence>
  );
};

export default GoogleAuth;
