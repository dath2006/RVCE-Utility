import React from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

const fileInputAccept = ".pdf,.doc,.docx,.ppt,.pptx,.txt";

const FileDropZone = ({
  isDragging,
  onDrop,
  onDragEnter,
  onDragLeave,
  onFileSelect,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`
        relative min-h-[200px] border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
            : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
        }
      `}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{
            y: isDragging ? [-5, 5, -5] : 0,
            rotate: isDragging ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 1,
            repeat: isDragging ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={`
            p-4 rounded-full transition-colors duration-300
            ${
              isDragging
                ? "bg-blue-500/20 text-blue-400"
                : "bg-slate-700/50 text-slate-400"
            }
          `}
        >
          <Upload size={32} />
        </motion.div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-white">
            {isDragging ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-slate-400">
            or{" "}
            <span className="text-blue-400 hover:text-blue-300 underline">
              browse files
            </span>
          </p>
          <p className="text-sm text-slate-500">
            PDF, DOC, PPT files up to 20MB each
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept={fileInputAccept}
        onChange={onFileChange}
      />

      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default FileDropZone;
