import { IUser } from "../models/user";

export interface Ierrors {
  anonymousName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  signIn?: string;
  otp?: string;
  serverError?: string;
  verifyError?: string;
}

export interface AuthState {
  uiState: {
    timer: number,
    passwordStrength: number,
    canResend: boolean,
    showPassword: boolean;
    showConfirmPassword: boolean;
    isVerified: boolean;
    isLoading: boolean;
    mode: "signin" | "signup" | "forgot";
    step: number;
    signInStep: number;
    error: Ierrors,
  };
  formState: {
    anonymousName: string;
    email: string;
    password: string;
    confirmPassword: string;
    otpValues: string[];
  };
}

export interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export type AuthMode = 'signin' | 'signup';

export interface AuthResponse {
  userData: IUser;
  accessToken: string;
}
