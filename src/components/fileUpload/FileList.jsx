import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileItem from "./FileItem";

const FileList = ({ files, onRemoveFile, isUploading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2 sm:space-y-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-1 sm:gap-2">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white flex-shrink-0">
          Files ({files.length})
        </h3>
        <div className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 bg-slate-700/50 rounded-full text-xs sm:text-sm text-slate-300 flex-shrink-0">
          {files.filter((f) => f.uploaded).length}/{files.length}
        </div>
      </div>

      <div className="max-h-40 sm:max-h-48 lg:max-h-64 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 overflow-x-hidden">
        <AnimatePresence>
          {files.map((fileItem, index) => (
            <FileItem
              key={`${fileItem.id}kkkd${index}`}
              fileItem={fileItem}
              onRemove={onRemoveFile}
              isUploading={isUploading}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FileList;
