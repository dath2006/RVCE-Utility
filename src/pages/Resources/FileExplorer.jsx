import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, LoaderCircle } from "lucide-react";

import FileCard from "./FileCard";
import FileViewer from "../../components/FileViewer";
import { useWindowContext } from "../../components/FileViewer/WindowContext";
import WindowManager from "../../components/FileViewer/WindowManager";
import { useOverlay } from "../../contexts/NavigationContext";

const RECENT_FILES_KEY = "resources_recent_files";
const MAX_RECENT_FILES = 10;

const FileExplorer = ({
  currentPath,
  searchQuery,
  filteredFiles,
  onPathChange,
  rootFolders,
  recentOpenRequest,
}) => {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("workspace");
    return saved ? JSON.parse(saved) : [];
  });
  const [viewerFile, setViewerFile] = useState(null);
  const [viewerModalId, setViewerModalId] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeCardId, setActiveCardId] = useState(null);

  const { addWindow, getAllWindowsId, setWindows } = useWindowContext();

  const [isMobile, setIsMobile] = useState(false);

  useOverlay("resourcesFileViewer", isMobile && !!viewerFile);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          )) &&
        window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        const saved = localStorage.getItem("windows");
        if (saved) {
          setShowViewer(true);
        }
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    let timeoutId;
    if (downloadStatus === "ready") {
      timeoutId = setTimeout(() => {
        setDownloadStatus(null);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [downloadStatus]);

  useEffect(() => {
    localStorage.setItem("workspace", JSON.stringify(files));
  }, [files]);

  const trackRecentFile = (item) => {
    if (!item?.id || !item?.webViewLink) {
      return;
    }

    const nextFile = {
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      webViewLink: item.webViewLink,
      webContentLink: item.webContentLink,
      path: item.path,
      parentName: item.parentName,
      lastViewedAt: Date.now(),
    };

    const saved = localStorage.getItem(RECENT_FILES_KEY);
    const prev = saved ? JSON.parse(saved) : [];
    const deduped = prev.filter((file) => file.id !== item.id);
    const next = [nextFile, ...deduped].slice(0, MAX_RECENT_FILES);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(next));
  };

  const getCurrentFolder = () => {
    if (searchQuery) return filteredFiles;
    let current = rootFolders;
    if (!current) {
      return [];
    }
    for (const path of currentPath) {
      current = current.find((item) => item.name === path)?.children || [];
    }
    return current;
  };

  const currentFolder = getCurrentFolder();

  const onAddToWorkspace = (item) => {
    const exists = JSON.parse(localStorage.getItem("workspace"));
    if (exists && !exists.find((file) => file.id === item.id)) {
      if (!searchQuery) {
        item.parentName = currentPath[0];
      } else {
        item.parentName = ["ESC", "PLC", "ETC"].includes(
          item.path[0].split(" ")[0],
        )
          ? item.path[1]
          : item.path[0];
      }

      setFiles(() => [...exists, item]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const onView = (item) => {
    trackRecentFile(item);

    if (!isMobile && getAllWindowsId().includes(item.id)) {
      setWindows((prev) =>
        prev.map((window) => {
          if (window.contentId === item.id) {
            return { ...window, state: "normal", isActive: true };
          }
          return window;
        }),
      );
      return;
    }

    if (isMobile) {
      setViewerModalId((id) => id + 1);
      setViewerFile(item);
    } else {
      setShowViewer(true);
      addWindow(item.name || "New Document", item.webViewLink, item.id);
    }
  };

  useEffect(() => {
    if (!recentOpenRequest?.id || !recentOpenRequest?.webViewLink) {
      return;
    }

    onView(recentOpenRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentOpenRequest?.openedAt]);

  const onDownload = async (item) => {
    try {
      setDownloadStatus("preparing");

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.src = item.webContentLink;

      setTimeout(() => {
        setDownloadStatus("ready");
      }, 4000);

      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      };
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadStatus(null);
    }
  };

  const handleCloseViewer = () => {
    setViewerFile(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-2 pb-[7.5rem] sm:grid-cols-2 sm:gap-3 sm:pb-[6.5rem] lg:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] lg:gap-4 lg:pb-[5.5rem]">
        {currentFolder.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            isSearchResult={Boolean(searchQuery)}
            onNavigate={() => onPathChange([...currentPath, item.name])}
            onAddToWorkspace={onAddToWorkspace}
            onDownload={() => onDownload(item)}
            onView={onView}
            activeCardId={activeCardId}
            setActiveCardId={setActiveCardId}
          />
        ))}
      </div>

      <AnimatePresence>
        {isMobile && viewerFile && viewerFile.webViewLink && (
          <FileViewer
            key={`mobile-${viewerFile.id}-${viewerModalId}`}
            url={viewerFile.webViewLink}
            title={viewerFile.name}
            onClose={handleCloseViewer}
          />
        )}

        {!isMobile && showViewer && <WindowManager />}

        {downloadStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-4 z-[1000] flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 text-sm shadow-lg backdrop-blur sm:right-8"
          >
            {downloadStatus === "preparing" && (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <LoaderCircle className="h-5 w-5 text-primary" />
                </motion.span>
                <span>Preparing download...</span>
              </>
            )}
            {downloadStatus === "ready" && (
              <>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Download className="h-5 w-5 text-primary" />
                </motion.span>
                <span>Download ready!</span>
              </>
            )}
          </motion.div>
        )}

        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-20 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4" /> Added to workspace
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

FileExplorer.propTypes = {
  currentPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchQuery: PropTypes.string,
  onPathChange: PropTypes.func.isRequired,
  rootFolders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      mimeType: PropTypes.string.isRequired,
      children: PropTypes.array,
    }),
  ).isRequired,
  recentOpenRequest: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    webViewLink: PropTypes.string,
    webContentLink: PropTypes.string,
    openedAt: PropTypes.number,
  }),
};

export default FileExplorer;
