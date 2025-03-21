import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { useGlobalState } from '../../../application/hooks/useGlobalState';
import { OtpInputProps, AuthState, AuthMode, Ierrors, AuthResponse } from '../../../domain/types/Authentication';
import { containerVariants, itemVariants } from '../../../constants/design';
import PasswordInput from './PasswordInput';
import { useApi } from '../../../application/hooks/useApi';
import { ApiResponse } from '../../../domain/models/requestModel';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { login } from '../../../infrastructure/redux/slices/authSlice';
import GoogleAuth from './Google/GoogleAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthSuccessMessage from './AuthSuccessMessage';
const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = [...value];
    const inputValue = e.target.value.replace(/[^0-9]/g, "");

    newValue[index] = inputValue.slice(-1);
    onChange(newValue);

    if (inputValue && index < value.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex justify-center gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-14 h-16 text-center text-xl font-semibold 
                     rounded-lg border-2 border-gray-300 focus:border-indigo-500 
                     focus:ring-2 focus:ring-indigo-300 outline-none 
                     bg-white text-black shadow-sm transition-all"
        />
      ))}
    </div>
  );
};

// Social Button Component
const SocialButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-gray-300 hover:bg-gray-50  dark:hover:bg-gray-200 transition-all"
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);


// Main Authentication Component
const Authentication: React.FC = () => {
  const { state, updateState } = useGlobalState<AuthState>({
    uiState: {
      timer: 0,
      passwordStrength: 0,
      canResend: false,
      showPassword: false,
      showConfirmPassword: false,
      isVerified: false,
      isLoading: false,
      mode: "signin",
      step: 1,
      signInStep: 1,
      error: {},
    },
    formState: {
      anonymousName: "",
      email: "",
      password: "",
      confirmPassword: "",
      otpValues: ["", "", "", "", ""],
    },
  });
  const { request: signInApi } = useApi();
  const { request: requestOtp } = useApi();
  const { request: verifyOtp } = useApi();
  const { request: createAccount } = useApi();
  const { request: updatePassword } = useApi();
  const { request: verifyNewUser } = useApi();

  const navigate = useNavigate();
  const dispatch = useDispatch();




  useEffect(() => {
    if (state.uiState.timer > 0) {
      const interval = setInterval(() => {
        updateState("uiState", { timer: state.uiState.timer - 1 })
      }, 1000);

      return () => clearInterval(interval);
    } else {
      updateState("uiState", { canResend: true })
    }
  }, [state.uiState.timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (state.formState?.email) {
      updateState("uiState", { isLoading: true });
      try {
        let response = await requestOtp("post", "/auth/new-otp", { email: state.formState.email });
        const { success, message } = response as ApiResponse;
        if (!success) {
          updateState("uiState", { error: { otp: message } });
          return { success: false };
        }
        updateState("uiState", { timer: 30, canResend: false })
        return { success: true };
      } catch {
        updateState("uiState", { error: { otp: "OTP not send. Please try again." } });
        return { success: false };
      } finally {
        updateState("uiState", { isLoading: false });
      }
    }
  };
  const handleVerifyOtp = async (email: string, otp: string) => {
    updateState("uiState", { isLoading: true });
    try {
      let response = await verifyOtp('post', '/auth/verify-otp', { email, otp });
      const { success, message } = response as ApiResponse;
      if (!success) {
        updateState("uiState", { error: { otp: message } });
        return;
      }
      updateState("uiState", { isVerified: true, step: 3, signInStep: 3 });
    } catch {
      updateState("uiState", { error: { otp: "OTP not verified. Please try again." } });
    } finally {
      updateState("uiState", { isLoading: false });
    }
  }

  const handleAuthSuccess = (data: AuthResponse) => {
    if (!data || !data.accessToken || !data.userData) {
      console.error("Invalid authentication response");
      return;
    }

    dispatch(login({ token: data.accessToken, user: data.userData }));

    switch (data.userData.role) {
      case "user":
        navigate("/home");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "super_admin":
        navigate("/super-admin/dashboard");
        break;
      case "expert":
        navigate("/expert-panel");
        break;
      default:
        navigate("/unauthorized");
        break;
    }
  };

  const handleCreateAccount = async (anonymousName: string, email: string, password: string) => {
    updateState("uiState", { isLoading: true });
    try {
      let response = await createAccount('post', '/auth/signup', { anonymousName, email, password });
      const { success, message, data } = response as ApiResponse;
      if (!success) {
        updateState("uiState", { error: { verifyError: message } });
        return;
      }
      updateState("uiState", { isVerified: true, step: 4 });
      setTimeout(() => {
        updateState("uiState", { error: {} });
        handleAuthSuccess(data)
      }, 3000);
    } catch {
      updateState("uiState", { error: { verifyError: "Account not created. Please try again." } });
    } finally {
      updateState("uiState", { isLoading: false })
    }
  }
  // Handle Sign-in
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    let errors: Ierrors = {};

    if (!state.formState.email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(state.formState.email)) {
      errors.email = "Invalid email format";
    }
    if (!state.formState.password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      updateState("uiState", { error: errors });
      return;
    }

    updateState("uiState", { isLoading: true });
    try {
      const response = await signInApi("post", "/auth/login", { email: state.formState.email, password: state.formState.password });
      const { success, message, data } = response as ApiResponse;

      if (!success) {
        updateState("uiState", { error: { signIn: message } });
        return;
      }
      updateState("uiState", { isVerified: true, signInStep: 5 });
      setTimeout(() => {
        updateState("uiState", { error: {} });
        handleAuthSuccess(data)
      }, 3000);
    } catch (err) {
      console.log(err);
      updateState("uiState", { error: { signIn: "Something went wrong. Please try again." } });
    } finally {
      updateState("uiState", { isLoading: false });
    }
  };
  const handleUpdatePassword = async (email: string, password: string) => {
    updateState("uiState", { isLoading: true });
    try {
      let response = await updatePassword('post', '/auth/update-password', { email, password });
      const { success, message } = response as ApiResponse;
      if (!success) {
        updateState("uiState", { error: { serverError: message } });
        return;
      }
      updateState("uiState", { signInStep: 4 });
      setTimeout(() => {
        updateState("uiState", { step: 1, isVerified: false, signInStep: 1 });
        updateState("formState", { anonymousName: '', password: '', confirmPassword: '', otpValues: ['', '', '', '', ''] })
        updateState("uiState", { error: {} });
      }, 3000);
    } catch {
      updateState("uiState", { error: { serverError: "Something went wrong. Please try again." } });
    } finally {
      updateState("uiState", { isLoading: false });
    }
  }
  const handleVerifyNewUser = async (anonymousName: string, email: string) => {
    if (email && anonymousName) {
      updateState("uiState", { isLoading: true });
      try {
        let response = await verifyNewUser("post", "/auth/new-user", { anonymousName, email });
        const { success, message, data } = response as ApiResponse;
        if (!success) {
          if (data === 'anonymousName') {
            updateState("uiState", { error: { anonymousName: message } });
          } else if (data === 'email') {
            updateState("uiState", { error: { email: message } });
          } else {
            updateState("uiState", { error: { verifyError: message } });
          }
          return
        }
        updateState("uiState", { timer: 30, canResend: false, step: 2 })
      } catch {
        updateState("uiState", { error: { verifyError: "Something went wrong. Please try again." } });
      } finally {
        updateState("uiState", { isLoading: false });
      }
    }
  };

  const resetSignupFlow = () => {
    updateState("uiState", { step: 1, isVerified: false, signInStep: 1 });
    updateState("formState", { anonymousName: '', email: '', password: '', confirmPassword: '', otpValues: ['', '', '', '', ''] })
    updateState("uiState", { error: {} });
  };

  const handleModeToggle = (newMode: AuthMode) => {
    updateState("uiState", { mode: newMode });
    resetSignupFlow();
  };



  // Handle Next Step
  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    let errors: Ierrors = {};

    if (state.uiState.step === 1) {
      if (!state.formState.anonymousName.trim()) {
        errors.anonymousName = "Anonymous name is required";
      }
      if (!state.formState.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(state.formState.email)) {
        errors.email = "Invalid email format";
      }

      if (Object.keys(errors).length > 0) {
        updateState("uiState", { error: errors });
        return;
      }

      await handleVerifyNewUser(state.formState.anonymousName, state.formState.email)
    }

    if (state.uiState.step === 2) {
      if (state.formState.otpValues.some((otp) => !otp.trim())) {
        errors.otp = "All OTP fields must be filled";
        updateState("uiState", { error: errors });
        return;
      }
      await handleVerifyOtp(state.formState.email, state.formState.otpValues.join(""))
    }

    if (state.uiState.step === 3) {
      if (!state.formState.password.trim()) {
        errors.password = "Password is required";
      } else if (state.uiState.passwordStrength < 4) {
        errors.password = "Password is too weak";
      }
      if (!state.formState.confirmPassword.trim()) {
        errors.confirmPassword = "Confirm password is required";
      } else if (state.formState.password !== state.formState.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (Object.keys(errors).length > 0) {
        updateState("uiState", { error: errors });
        return;
      }

      await handleCreateAccount(state.formState.anonymousName, state.formState.email, state.formState.password)
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    let errors: Ierrors = {};

    if (state.uiState.signInStep === 1) {

      if (!state.formState.email) {
        errors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(state.formState.email)) {
        errors.email = "Invalid email format";
      }
      if (Object.keys(errors).length > 0) {
        updateState("uiState", { error: errors });
        return;
      }

      const response = await handleSendOtp();

      if (response?.success) {
        updateState("uiState", { signInStep: 2, timer: 30, canResend: false });
      }

    } else if (state.uiState.signInStep === 2) {

      if (state.formState.otpValues.some((otp) => !otp.trim())) {
        errors.otp = "All OTP fields must be filled";
      }
      if (Object.keys(errors).length > 0) {
        updateState("uiState", { error: errors });
        return;
      }
      await handleVerifyOtp(state.formState.email, state.formState.otpValues.join(""))

    } else if (state.uiState.signInStep === 3) {

      if (!state.formState.password) {
        errors.password = "Password is required";
      } else if (state.formState.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (!state.formState.confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
      } else if (state.formState.password !== state.formState.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      if (Object.keys(errors).length > 0) {
        updateState("uiState", { error: errors });
        return;
      }
      await handleUpdatePassword(state.formState.email, state.formState.password)
    }
  };


  const handlePrevStep = () => {
    if (state.uiState.step > 1) {
      updateState("uiState", { step: state.uiState.step - 1 })
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden relative z-10 backdrop-blur-sm border border-slate-100"
      >
        {/* Mode Toggle */}
        <div className="relative flex gap-5 rounded-t-2xl p-3 ml-3 mr-3 pt-6">
          <div
            className={`absolute h-10 transition-all duration-300 border border-slate-300 bg-white rounded-lg shadow-sm z-0 ${state.uiState.mode === 'signin' ? 'w-1/2 left-1' : 'w-1/2 left-1/2'
              }`}
          />
          <button
            onClick={() => handleModeToggle('signin')}
            className={`flex-1 py-2 rounded-lg z-10 transition-all duration-300 ${state.uiState.mode === 'signin'
              ? 'text-blue-600 font-medium'
              : 'text-slate-500 hover:text-slate-700 bg-white'
              }`}
          >
            Sign in
          </button>
          <button
            onClick={() => handleModeToggle('signup')}
            className={`flex-1 py-2  rounded-lg z-10 transition-all duration-300 ${state.uiState.mode === 'signup'
              ? 'text-blue-600 font-medium'
              : 'text-slate-500 hover:text-slate-700 bg-white'
              }`}
          >
            Sign up
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {state.uiState.mode === 'signin' ? (
              <motion.form
                key="signin"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
              >
                {state.uiState.signInStep === 1 && (
                  <>
                    <motion.h2
                      variants={itemVariants}
                      className="text-2xl font-bold mb-6 text-center"
                    >
                      Welcome Back
                    </motion.h2>

                    <motion.div variants={itemVariants} className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={state.formState.email}
                        onChange={(e) => {
                          updateState("formState", { email: e.target.value });

                          if (state.uiState?.error?.email) {
                            let updatedErrors = { ...state.uiState.error };
                            delete updatedErrors.email;
                            updateState("uiState", { error: updatedErrors });
                          }
                          if (state.uiState?.error?.otp) {
                            let updatedErrors = { ...state.uiState.error };
                            delete updatedErrors.otp;
                            updateState("uiState", { error: updatedErrors });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState.error?.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder="you@example.com"
                      />
                      <ErrorMessage message={state.uiState?.error?.email} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-2">
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          autoComplete="current-password"
                          type={state.uiState.showPassword ? "text" : "password"}
                          value={state.formState.password}
                          onChange={(e) => {
                            updateState("formState", { password: e.target.value });

                            if (state.uiState?.error?.password) {
                              let updatedErrors = { ...state.uiState.error };
                              delete updatedErrors.password;
                              updateState("uiState", { error: updatedErrors });
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState.error?.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => updateState("uiState", { showPassword: !state.uiState.showPassword })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 "
                        >
                          {state.uiState.showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <ErrorMessage message={state.uiState?.error?.password} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-right mb-6">
                      <motion.button onClick={handleForgotPassword} className="text-sm hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-450 cursor-pointer">
                        Forgot password?
                      </motion.button>
                    </motion.div>
                    <motion.div variants={itemVariants} className="text-center justify-center mb-2">
                      <ErrorMessage message={state.uiState?.error?.signIn} centered />
                      <ErrorMessage message={state.uiState?.error?.otp} centered />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignin}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={state.uiState.isLoading || !state.formState.email || !state.formState.password}
                      >
                        {state.uiState.isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          "Submit"
                        )}
                      </motion.button>
                    </motion.div>
                  </>
                )}

                {state.uiState.signInStep === 2 && (
                  <motion.div
                    key="step2"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants} className="text-center mb-6">
                      <h3 className="text-lg font-medium mb-2">Verify Your Email</h3>
                      <p className="mb-6">
                        We've sent a 5-digit verification code to <br />
                        <span className="font-medium">{state.formState.email}</span>
                      </p>
                      <OtpInput
                        value={state.formState.otpValues}
                        onChange={(newOtpValues) => {
                          updateState("formState", { otpValues: newOtpValues })
                          if (state.uiState?.error?.otp) {
                            let updatedErrors = { ...state.uiState.error };
                            delete updatedErrors.otp;
                            updateState("uiState", { error: updatedErrors });
                          }
                        }
                        }
                      />
                      <p className="mt-6 text-sm">
                        Didn't receive the code?{" "}
                        <button
                          onClick={handleSendOtp}
                          disabled={!state.uiState.canResend}
                          className={`${state.uiState.canResend
                            ? "text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                            } font-medium transition-all`}
                        >
                          {state.uiState.canResend ? "Resend OTP" : `Resend in ${state.uiState.timer}s`}
                        </button>
                      </p>
                      <ErrorMessage message={state.uiState?.error?.otp} centered />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleForgotPassword}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={state.uiState.isLoading || state.formState.otpValues.some(v => !v)}
                      >
                        {state.uiState.isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          "Verify OTP"
                        )}
                      </motion.button>

                    </motion.div>
                  </motion.div>
                )}
                {state.uiState.signInStep === 3 && (
                  <motion.div
                    key="step3"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >

                    <PasswordInput state={state} updateState={updateState} />

                    <motion.div variants={itemVariants} className="mb-6">
                      <label className="block text-sm font-medium mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={state.uiState?.showPassword ? "text" : "password"}
                          value={state.formState.confirmPassword}
                          onChange={(e) => {
                            updateState("formState", { confirmPassword: e.target.value });

                            if (state.uiState?.error?.confirmPassword) {
                              let updatedErrors = { ...state.uiState.error };
                              delete updatedErrors.confirmPassword;
                              updateState("uiState", { error: updatedErrors });
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState.error?.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                      <ErrorMessage message={state.uiState?.error?.confirmPassword} />
                    </motion.div>
                    <ErrorMessage message={state.uiState?.error?.serverError} />
                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileHover={{ scale: state.uiState.isLoading || state.uiState.passwordStrength < 4 || !state.formState.password || !state.formState.confirmPassword || (state.formState.password !== state.formState.confirmPassword) ? 1 : 1.02 }}
                        whileTap={{ scale: state.uiState.isLoading || state.uiState.passwordStrength < 4 || !state.formState.password || !state.formState.confirmPassword || (state.formState.password !== state.formState.confirmPassword) ? 1 : 0.98 }}
                        onClick={handleForgotPassword}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                      ${state.uiState.isLoading || state.uiState.passwordStrength < 4 || !state.formState.password || !state.formState.confirmPassword || (state.formState.password !== state.formState.confirmPassword)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                        disabled={
                          state.uiState.isLoading ||
                          !state.formState.password ||
                          !state.formState.confirmPassword ||
                          (state.formState.password !== state.formState.confirmPassword) ||
                          (state.uiState.passwordStrength < 4)
                        }
                      >
                        {state.uiState.isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          "Submit"
                        )}
                      </motion.button>

                    </motion.div>
                  </motion.div>
                )}

                {state.uiState.signInStep === 4 && (
                  <AuthSuccessMessage authType={"updatePassword"} />
                )}
                {state.uiState.signInStep === 5 && (
                  <AuthSuccessMessage authType={"signin"} />
                )}
                {state.uiState.signInStep === 6 && (
                  <AuthSuccessMessage authType={"googleAuth"} />
                )}

                {state.uiState.signInStep !== 4 && state.uiState.signInStep !== 5 && (
                  <motion.div variants={itemVariants} className="mt-8">
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                      <span className="flex-shrink mx-4  text-sm">or sign in with</span>
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                        <GoogleAuth updateState={updateState} handleAuthSuccess={handleAuthSuccess} />
                      </GoogleOAuthProvider>
                      <SocialButton icon={<FaGithub className="text-gray-800 " />} label="GitHub" />
                      {/* <SocialButton icon={<FaFacebook className="text-blue-600" />} label="Facebook" /> */}
                    </div>
                  </motion.div>
                )}

              </motion.form>
            ) : (
              <motion.div
                key="signup"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="relative"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-1xl font-bold text-center text-gray-900">{state.uiState.step === 3 ? 'Make it unpredictable' : state.uiState.step === 2 ? 'Verify Your Email' : 'Create your account'}</h3>
                  <div className="flex">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${state.uiState.step >= i
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-300 text-gray-100 dark:text-gray-500'
                            }`}
                        >
                          {state.uiState.step > i ? <FaCheck /> : i}
                        </div>
                        {i < 3 && (
                          <div
                            className={`w-8 h-1 ${state.uiState.step > i
                              ? 'bg-indigo-600'
                              : 'bg-gray-200 dark:bg-gray-400'
                              }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {state.uiState.step === 1 && (
                    <motion.div
                      key="step1"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={containerVariants}
                    >
                      <motion.div variants={itemVariants} className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Anonymous Name
                        </label>
                        <input
                          type="text"
                          value={state.formState.anonymousName}
                          onChange={(e) => {
                            updateState("formState", { anonymousName: e.target.value });

                            if (state.uiState.error.anonymousName) {
                              let updatedErrors = { ...state.uiState.error };
                              delete updatedErrors.anonymousName;
                              updateState("uiState", { error: updatedErrors });
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState.error.anonymousName ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="Shadow"
                        />
                        <ErrorMessage message={state.uiState?.error?.anonymousName} />
                      </motion.div>

                      <motion.div variants={itemVariants} className="mb-6">
                        <label className="block text-sm font-medium mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={state.formState.email}
                          onChange={(e) => {
                            updateState("formState", { email: e.target.value });

                            if (state.uiState?.error?.email) {
                              let updatedErrors = { ...state.uiState.error };
                              delete updatedErrors.email;
                              updateState("uiState", { error: updatedErrors });
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState?.error?.email ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="you@example.com"
                        />
                        <ErrorMessage message={state.uiState?.error?.email} />
                      </motion.div>
                    </motion.div>
                  )}

                  {state.uiState.step === 2 && (
                    <motion.div
                      key="step2"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={containerVariants}
                    >
                      <motion.div variants={itemVariants} className="text-center mb-6">
                        <p className="mb-6">
                          We've sent a 5-digit verification code to <br />
                          <span className="font-medium">{state.formState.email}</span>
                        </p>
                        <OtpInput
                          value={state.formState.otpValues}
                          onChange={(newOtpValues) => {
                            updateState("formState", { otpValues: newOtpValues });

                            if (state.uiState?.error?.otp) {
                              let updatedErrors = { ...state.uiState.error };
                              delete updatedErrors.otp;
                              updateState("uiState", { error: updatedErrors });
                            }
                          }}
                        />
                        <p className="mt-6 text-sm ">
                          Didn't receive the code?{" "}
                          <button
                            onClick={handleSendOtp}
                            disabled={!state.uiState.canResend}
                            className={`${state.uiState.canResend
                              ? "text-indigo-600 hover:text-indigo-800  cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                              } font-medium transition-all`}
                          >
                            {state.uiState.canResend ? "Resend OTP" : `Resend in ${state.uiState.timer}s`}
                          </button>
                        </p>
                        <ErrorMessage message={state.uiState?.error?.otp} centered />

                      </motion.div>
                    </motion.div>
                  )}


                  {state.uiState.step === 3 && (
                    <motion.div
                      key="step3"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={containerVariants}
                    >
                      <PasswordInput state={state} updateState={updateState} />

                      <motion.div variants={itemVariants} className="mb-6">
                        <label className="block text-sm font-medium mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={state.uiState.showConfirmPassword ? "text" : "password"}
                            value={state.formState.confirmPassword}
                            onChange={(e) => {
                              updateState("formState", { confirmPassword: e.target.value });

                              if (state.uiState?.error?.confirmPassword) {
                                let updatedErrors = { ...state.uiState.error };
                                delete updatedErrors.confirmPassword;
                                updateState("uiState", { error: updatedErrors });
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg bg-gray-100 border ${state.uiState?.error?.confirmPassword ? "border-red-500" : "border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="Confirm your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => updateState("uiState", { showConfirmPassword: !state.uiState.showConfirmPassword })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {state.uiState.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <ErrorMessage message={state.uiState?.error?.confirmPassword} />

                      </motion.div>
                    </motion.div>
                  )}

                  {state.uiState.step === 4 && (
                    <AuthSuccessMessage authType={"signup"} />
                  )}
                  {state.uiState.step === 5 && (
                    <AuthSuccessMessage authType={"googleAuth"} />
                  )}

                </AnimatePresence>
                <ErrorMessage message={state.uiState?.error?.verifyError} centered />

                {state.uiState.step < 4 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-between mt-8"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className={`px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-600 font-medium transition-all duration-300 ${state.uiState.step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      disabled={state.uiState.step === 1}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      disabled={state.uiState.isLoading || (state.uiState.step === 1 && (!state.formState.email || !state.formState.anonymousName)) || (state.uiState.step === 2 && state.formState.otpValues.some(v => !v)) || (state.uiState.step === 3 && (!state.formState.password || state.formState.password !== state.formState.confirmPassword || state.uiState.passwordStrength < 4))}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.uiState.isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        state.uiState.step === 3 ? "Create Account" : "Continue"
                      )}
                    </motion.button>
                  </motion.div>
                )}
                <motion.div variants={itemVariants} className="mt-8">
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                    <span className="flex-shrink mx-4  text-sm">or sign in with</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                      <GoogleAuth updateState={updateState} handleAuthSuccess={handleAuthSuccess} />
                    </GoogleOAuthProvider>
                    <SocialButton icon={<FaGithub className="text-gray-800 " />} label="GitHub" />
                    {/* <SocialButton icon={<FaFacebook className="text-blue-600" />} label="Facebook" /> */}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Authentication;