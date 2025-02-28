import React, { useState } from "react";
import zxcvbn from "zxcvbn";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { itemVariants } from "../../../constants/design";
import { motion } from 'framer-motion';

const PasswordInput: React.FC<{ state: any; updateState: any }> = ({ state, updateState }) => {
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;

    if (state.uiState.error.password) {
      let updatedErrors = { ...state.uiState.error };
      delete updatedErrors.password;
      updateState("uiState", { error: updatedErrors });
    }
    updateState("formState", { password });

    const result = zxcvbn(password);
    let feedback = [...result.feedback.suggestions];

    // Custom Validations
    let customFeedback: string[] = [];

    if (!/\d/.test(password)) {
      customFeedback.push("Include at least one number.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      customFeedback.push("Include at least one special character.");
    }
    if (/\s/.test(password)) {
      customFeedback.push("Do not include spaces.");
    }
    if (/[_]/.test(password)) {
      customFeedback.push("Do not include underscores.");
    }

    feedback = feedback.filter(
      (msg) => !msg.includes("No need for symbols") && !msg.includes("digits")
    );

    feedback = [...feedback, ...customFeedback];

    setPasswordFeedback(feedback);

    const finalStrength = feedback.length === 0 ? 4 : Math.min(result.score, 3);
    updateState("uiState", { passwordStrength: finalStrength });
  };


  return (
    <>
      <motion.div variants={itemVariants} className="mb-4">
        <label className="block text-sm font-medium mb-1">Create Password</label>
        <div className="relative">
          <input
            type={state.uiState.showPassword ? "text" : "password"}
            value={state.formState.password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Create a strong password"
            required
          />
          <button
            type="button"
            onClick={() => updateState("uiState", { showPassword: !state.uiState.showPassword })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {state.uiState.showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password Strength Meter */}
        <div className="mt-2">
          <div className="h-1 bg-gray-300 rounded-full ml-2.5 mr-2.5">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${state.uiState.passwordStrength === 0 ? "bg-red-500 w-1/5" :
                  state.uiState.passwordStrength === 1 ? "bg-orange-500 w-2/5" :
                    state.uiState.passwordStrength === 2 ? "bg-yellow-500 w-3/5" :
                      state.uiState.passwordStrength === 3 ? "bg-blue-500 w-4/5" :
                        "bg-green-500 w-full"
                }`}
            />
          </div>
          {/* <p className="text-sm mt-1">
            Strength: {["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"][state.uiState.passwordStrength]}
          </p> */}
          {passwordFeedback.length > 0 && (
            <ul className="text-xs text-gray-600 mt-1">
              {passwordFeedback.map((msg, index) => (
                <li key={index}>• {msg}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PasswordInput;
