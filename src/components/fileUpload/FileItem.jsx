import React from "react";
import { motion } from "framer-motion";
import { FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const FileItem = ({ fileItem, onRemove, isUploading }) => {
  const getStatusColor = () => {
    if (fileItem.error) return "text-red-400";
    if (fileItem.uploaded) return "text-green-400";
    if (fileItem.uploading) return "text-blue-400";
    return "text-slate-400";
  };

  const getStatusIcon = () => {
    if (fileItem.error) return <AlertCircle size={16} />;
    if (fileItem.uploaded) return <Check size={16} />;
    if (fileItem.uploading)
      return <Loader2 size={16} className="animate-spin" />;
    return null;
  };

  const getStatusText = () => {
    if (fileItem.error) return "Failed";
    if (fileItem.uploaded) return "Uploaded";
    if (fileItem.uploading) return `${fileItem.progress}%`;
    return "Pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <motion.div
            whilehover={{ scale: 1.1 }}
            className="flex-shrink-0 p-2 bg-blue-500/20 rounded-lg"
          >
            <FileText size={20} className="text-blue-400" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {fileItem.file.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(fileItem.file.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1 text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>

          {!fileItem.uploaded && !fileItem.uploading && (
            <motion.button
              whilehover={{ scale: 1.1 }}
              whiletap={{ scale: 0.9 }}
              onClick={() => onRemove(fileItem.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors duration-200"
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {fileItem.uploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fileItem.progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      )}

      {/* Error message */}
      {fileItem.error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-red-400 mt-2"
        >
          {fileItem.error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FileItem;
