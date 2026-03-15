import React from "react";
import { motion } from "framer-motion";
import { FileUp, Sparkles } from "lucide-react";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={`relative min-h-[180px] rounded-2xl border-2 border-dashed p-5 text-center transition ${
        isDragging
          ? "border-primary/60 bg-primary/10"
          : "border-border/70 bg-muted/35 hover:border-primary/35 hover:bg-muted/55"
      }`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${
            isDragging
              ? "border-primary/45 bg-primary/20 text-primary"
              : "border-border/70 bg-background/80 text-muted-foreground"
          }`}
        >
          <FileUp className="h-5 w-5" />
        </div>

        <div>
          <p className="text-base font-semibold">
            {isDragging
              ? "Drop files to queue upload"
              : "Drag and drop files here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse local files
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          PDF, DOC, DOCX, PPT, PPTX, TXT
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
    </motion.div>
  );
};

export default FileDropZone;
