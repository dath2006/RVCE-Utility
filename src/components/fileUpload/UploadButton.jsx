import React from "react";
import { motion } from "framer-motion";
import { Loader2, Upload } from "lucide-react";

const UploadButton = ({ onClick, disabled, isUploading, fileCount }) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        disabled
          ? "cursor-not-allowed border border-border/70 bg-muted/50 text-muted-foreground"
          : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      }`}
    >
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      <span>
        {isUploading
          ? "Uploading files..."
          : `Upload ${fileCount} file${fileCount !== 1 ? "s" : ""}`}
      </span>
    </motion.button>
  );
};

export default UploadButton;
