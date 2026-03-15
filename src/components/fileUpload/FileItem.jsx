import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, FileText, Loader2, X } from "lucide-react";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const truncateFileName = (fileName, isMobile = false) => {
  if (!fileName) return "";
  const maxLength = isMobile ? 20 : 38;
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.split(".").pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
  const truncatedName = nameWithoutExt.substring(
    0,
    maxLength - extension.length - 4,
  );

  return `${truncatedName}...${extension}`;
};

const FileItem = ({ fileItem, onRemove }) => {
  const statusMeta = (() => {
    if (fileItem.error) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Failed",
        className: "text-rose-500",
      };
    }

    if (fileItem.uploaded) {
      return {
        icon: <Check className="h-4 w-4" />,
        text: "Uploaded",
        className: "text-emerald-600",
      };
    }

    if (fileItem.uploading) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: `${fileItem.progress}%`,
        className: "text-primary",
      };
    }

    return {
      icon: null,
      text: "Pending",
      className: "text-muted-foreground",
    };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-border/70 bg-background/85 p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/55 text-muted-foreground">
            <FileText className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium"
              title={fileItem.file.name}
            >
              <span className="sm:hidden">
                {truncateFileName(fileItem.file.name, true)}
              </span>
              <span className="hidden sm:inline">
                {truncateFileName(fileItem.file.name, false)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(fileItem.file.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${statusMeta.className}`}
          >
            {statusMeta.icon}
            {statusMeta.text}
          </span>

          {!fileItem.uploaded && !fileItem.uploading && (
            <button
              type="button"
              onClick={() => onRemove(fileItem.id)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {fileItem.uploading && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fileItem.progress}%` }}
            transition={{ duration: 0.2 }}
            className="h-full bg-primary"
          />
        </div>
      )}

      {fileItem.error && (
        <p className="mt-2 text-xs text-rose-500">{fileItem.error}</p>
      )}
    </motion.div>
  );
};

export default FileItem;
