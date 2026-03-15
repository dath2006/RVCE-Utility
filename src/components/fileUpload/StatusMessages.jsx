import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const StatusMessages = ({ error, uploadStatus }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-600"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            uploadStatus.success
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
              : "border-amber-500/25 bg-amber-500/10 text-amber-700"
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{uploadStatus.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessages;
