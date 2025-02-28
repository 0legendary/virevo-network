import { motion, AnimatePresence } from "framer-motion";
import { CgDanger } from "react-icons/cg";

export const ErrorMessage = ({ message, centered = false }: { message?: string, centered?: boolean }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={`text-red-500 text-sm flex items-center mt-1 ${centered ? "justify-center text-center" : ""}`}
        >
          <span className="mr-1"><CgDanger /></span> {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
};
