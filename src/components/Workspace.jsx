import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, FileText, Maximize2, X } from "lucide-react";

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

const ActionButton = ({ label, className = "", onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`s-iconbtn ${className}`}
  >
    {children}
  </button>
);

const WorkspaceCard = ({ file, onRemove, onView, onDownload }) => {
  const subject = getSubjectLabel(file);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="s-ws-row"
    >
      <span className="s-tile-icon">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="s-title truncate">{file.name}</p>
        <p className="s-body truncate" style={{ fontSize: "0.875rem" }}>
          {subject}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton label="View file" onClick={() => onView(file)}>
          <Eye className="h-4 w-4" />
        </ActionButton>
        <ActionButton label="Download file" onClick={() => onDownload(file)}>
          <Download className="h-4 w-4" />
        </ActionButton>
        <ActionButton
          label="Remove from workspace"
          className="s-iconbtn--danger"
          onClick={() => onRemove(file.id)}
        >
          <X className="h-4 w-4" />
        </ActionButton>
      </div>
    </motion.li>
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
        className="s-sheet fixed inset-x-0 bottom-0 z-[1001] flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 s-ws-pad py-3">
          <div>
            <h3 className="s-title" style={{ fontSize: "1.375rem" }}>
              Workspace
            </h3>
            <p className="s-label">
              {files.length} file{files.length === 1 ? "" : "s"} pinned
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={files.length === 0}
              className="s-btn s-btn--sm s-btn--quiet s-btn--danger"
            >
              Clear all
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setIsOpen(false);
              }}
              className="s-iconbtn"
              style={{ width: "2.5rem", height: "2.5rem" }}
              aria-label="Close workspace"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="s-scroll s-ws-pad relative flex-1 overflow-y-auto py-2">
          {files.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <img
                src="/UserManual/image.png"
                alt="Add files to workspace"
                className="h-auto w-full max-w-sm opacity-85"
              />
              <p className="s-body mt-4 max-w-md">
                Your workspace is empty. Add files with the + button and they
                will appear here for quick access.
              </p>
            </div>
          ) : (
            <ul className="s-ws-list">
              <AnimatePresence>
                {files.map((file) => (
                  <WorkspaceCard
                    key={file.id}
                    file={file}
                    onRemove={handleRemoveFile}
                    onView={onView}
                    onDownload={onDownload}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {downloadStatus && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="s-surface fixed bottom-6 right-4 z-[1002] rounded-lg px-4 py-3 text-sm shadow-xl sm:right-8"
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
