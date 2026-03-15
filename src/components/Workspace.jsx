import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Close,
  Description,
  Fullscreen,
  GetApp,
  Visibility,
} from "@mui/icons-material";

const getSubjectLabel = (file) => {
  if (file?.parentName) return file.parentName;
  if (!Array.isArray(file?.path) || file.path.length === 0) return "Resources";

  const first = file.path[0];
  const prefix = first?.split(" ")?.[0] || "";
  if (["ESC", "PLC", "ETC"].includes(prefix)) {
    return file.path[1] || file.path[0] || "Resources";
  }

  return file.path[0] || "Resources";
};

const ActionButton = ({ label, className, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background text-foreground transition hover:scale-105 hover:bg-accent ${className}`}
  >
    {children}
  </button>
);

const WorkspaceCard = ({ file, onRemove, onView, onDownload }) => {
  const subject = getSubjectLabel(file);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Description fontSize="small" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {file.name}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {subject}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:text-xs">
          {subject}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
        <ActionButton
          label="Remove from workspace"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onRemove(file.id)}
        >
          <Close fontSize="small" />
        </ActionButton>
        <ActionButton
          label="Download file"
          className="text-blue-600 hover:bg-blue-50"
          onClick={() => onDownload(file)}
        >
          <GetApp fontSize="small" />
        </ActionButton>
        <ActionButton
          label="View file"
          className="text-emerald-600 hover:bg-emerald-50"
          onClick={() => onView(file)}
        >
          <Visibility fontSize="small" />
        </ActionButton>
      </div>
    </motion.div>
  );
};

const Workspace = ({ onClose, setViewerFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("workspace");
    return saved ? JSON.parse(saved) : [];
  });
  const [downloadStatus, setDownloadStatus] = useState(null);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let timeoutId;
    if (downloadStatus === "ready") {
      timeoutId = setTimeout(() => {
        setDownloadStatus(null);
      }, 2800);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [downloadStatus]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("workspace", JSON.stringify(files));
  }, [files]);

  const panelStyle = useMemo(() => {
    if (isMobile) {
      return {
        top: "var(--app-nav-offset, 0px)",
        height:
          "calc(100dvh - var(--app-nav-offset, 0px) - env(safe-area-inset-bottom))",
      };
    }

    return {
      height: "min(78vh, 560px)",
    };
  }, [isMobile]);

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const onView = (item) => {
    onClose();
    setViewerFile(item);
  };

  const onDownload = async (item) => {
    try {
      setDownloadStatus("preparing");

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.src = item.webContentLink;

      setTimeout(() => {
        setDownloadStatus("ready");
      }, 3200);

      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 800);
      };
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadStatus(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? "0%" : "100%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={panelStyle}
        className="fixed inset-x-0 bottom-0 z-[1001] flex flex-col border-t border-border/80 bg-background/95 shadow-[0_-16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-3 sm:px-5">
          <div>
            <h3 className="text-base font-semibold sm:text-lg">Workspace</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {files.length} file{files.length === 1 ? "" : "s"} pinned
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={files.length === 0}
              className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              Clear all
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setIsOpen(false);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-accent"
              aria-label="Close workspace"
            >
              {isOpen ? <Close /> : <Fullscreen />}
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
          {files.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <img
                src="/UserManual/image.png"
                alt="Add files to workspace"
                className="h-auto w-full max-w-sm opacity-85"
              />
              <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                Your workspace is empty. Add files with the + button and they
                will appear here for quick access.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <WorkspaceCard
                    key={file.id}
                    file={file}
                    onRemove={handleRemoveFile}
                    onView={onView}
                    onDownload={onDownload}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {downloadStatus && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-4 z-[1002] rounded-xl border border-border bg-card/95 px-4 py-3 text-sm shadow-xl backdrop-blur sm:right-8"
          >
            {downloadStatus === "preparing" && "Preparing download..."}
            {downloadStatus === "ready" && "Download ready!"}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Workspace;
