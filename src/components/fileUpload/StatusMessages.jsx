import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";

const StatusMessages = ({ error, uploadStatus }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center space-x-2 p-4 rounded-lg ${
            uploadStatus.success
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
          }`}
        >
          <Check size={20} />
          <span>{uploadStatus.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessages;
