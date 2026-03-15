import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import FileItem from "./FileItem";

const FileList = ({ files, onRemoveFile, isUploading }) => {
  const uploadedCount = files.filter((file) => file.uploaded).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Files ({files.length})</h3>
        <div className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
          {uploadedCount}/{files.length}
        </div>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence>
          {files.map((fileItem, index) => (
            <FileItem
              key={`${fileItem.id}-${index}`}
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
