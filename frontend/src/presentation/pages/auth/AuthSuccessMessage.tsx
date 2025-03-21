import { containerVariants, itemVariants } from "@/constants/design";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

// Props Type
interface AuthSuccessMessageProps {
    authType: "signin" | "signup" | "googleAuth" | "updatePassword";
}

// Function to get messages based on authType
const getAuthMessages = (authType: string) => {
    switch (authType) {
        case "signin":
            return {
                title: "Welcome Back!",
                message: "You have successfully signed in. Redirecting...",
            };
        case "signup":
            return {
                title: "Account Created!",
                message: "Your account has been successfully created. Redirecting...",
            };
        case "googleAuth":
            return {
                title: "Google Authentication Successful!",
                message: "You have successfully signed in with Google. Redirecting...",
            };
        case "updatePassword":
            return {
                title: "Password Updated!",
                message: "Your password has been successfully updated. Redirecting...",
            };
        default:
            return {
                title: "Success!",
                message: "You have successfully authenticated. Redirecting...",
            };
    }
};

const AuthSuccessMessage: React.FC<AuthSuccessMessageProps> = ({ authType }) => {
    const { title, message } = getAuthMessages(authType);

    return (
        <motion.div
            key="authenticated"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="flex flex-col items-center py-8"
        >
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2,
                }}
                className="w-20 h-20 text-center bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
                <FaCheck className="text-white text-3xl" />
            </motion.div>

            {/* Success Message */}
            <motion.h3
                variants={itemVariants}
                className="text-xl text-center font-semibold text-gray-900 mb-3"
            >
                {title}
            </motion.h3>

            <motion.p
                variants={itemVariants}
                className="text-gray-700 text-center px-6 mb-6 leading-relaxed"
            >
                {message}
            </motion.p>

            {/* Progress Bar */}
            <motion.div variants={itemVariants} className="w-full max-w-sm mx-auto">
                <div className="h-1 w-full bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="h-full bg-green-500"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AuthSuccessMessage;
