import React from "react";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";

const UploadButton = ({ onClick, disabled, isUploading, fileCount }) => {
  return (
    <motion.button
      whilehover={!disabled ? { scale: 1.02 } : {}}
      whiletap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-white text-sm sm:text-base
        transition-all duration-300 relative overflow-hidden
        ${
          disabled
            ? "bg-slate-700 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-xl"
        }
      `}
    >
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      <div className="flex items-center space-x-2 relative z-10">
        {isUploading ? (
          <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
        ) : (
          <Upload size={18} className="sm:w-5 sm:h-5" />
        )}
        <span>
          {isUploading
            ? "Uploading Files..."
            : `Upload ${fileCount} File${fileCount !== 1 ? "s" : ""}`}
        </span>
      </div>
    </motion.button>
  );
};

export default UploadButton;
