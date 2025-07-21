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
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Selected Files ({files.length})
        </h3>
        <div className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">
          {files.filter((f) => f.uploaded).length} / {files.length} uploaded
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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
