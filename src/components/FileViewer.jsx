import React, { useState, useRef, useEffect, useCallback } from "react";
import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";

const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/70 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

const FileViewer = ({ url, onClose, title, ...motionProps }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Reset loading state when URL changes
  useEffect(() => {
    if (url) {
      setIsLoading(true);
    }
  }, [url]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Reload handler
  const handleReload = useCallback(() => {
    if (url) {
      setIsLoading(true);
      setReloadKey((key) => key + 1);
    }
  }, [url]);

  // Load handling
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const triggerSearch = () => {
    // Method 1: Focus and attempt to simulate Ctrl+F
    if (iframeRef.current) {
      // Focus on iframe first
      iframeRef.current.focus();

      try {
        // Try to create and dispatch a keyboard event
        const event = new KeyboardEvent("keydown", {
          key: "f",
          code: "KeyF",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });

        // This might not work across domains due to security restrictions
        iframeRef.current.contentWindow.document.dispatchEvent(event);
      } catch (error) {
        // If direct method fails, show instructions
        setSearchVisible(true);
        setTimeout(() => setSearchVisible(false), 5000); // Hide after 5 seconds
      }
    }
  };

  const compactHeader = isMobile || isFullscreen;
  const showSearchButton = !isMobile;
  const showTipLine = !isMobile;

  return (
    <motion.div
      initial={motionProps.initial ?? { x: "100%" }}
      animate={motionProps.animate ?? { x: 0 }}
      exit={motionProps.exit ?? { x: "100%" }}
      transition={
        motionProps.transition ?? {
          type: "spring",
          damping: 28,
          stiffness: 260,
        }
      }
      ref={containerRef}
      className="fixed inset-0 z-[120] flex cursor-default flex-col bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-md"
      {...motionProps}
    >
      <div
        className={`${isFullscreen ? "mx-0 mt-0 rounded-none border-x-0 border-t-0" : "mx-2 mt-2 rounded-xl sm:mx-4"} flex items-center justify-between border border-border/70 bg-card/90 px-2 ${compactHeader ? "py-1" : "py-1.5"} shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={iconButtonClass}
            onClick={handleReload}
            disabled={isLoading}
            title="Reload"
          >
            <CachedIcon />
          </button>
          {showSearchButton && (
            <button
              type="button"
              className={iconButtonClass}
              onClick={triggerSearch}
              disabled={isLoading}
              title="Search"
            >
              <SearchIcon />
            </button>
          )}

          <div className="min-w-0 pl-1">
            <p className="max-w-[46vw] truncate text-[11px] font-semibold text-foreground sm:max-w-[55vw] sm:text-sm">
              {title || "Document Viewer"}
            </p>
            {showTipLine && (
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                Tip: tap inside document and use Ctrl+F / Cmd+F
              </p>
            )}
          </div>

          {searchVisible && (
            <div className="absolute left-3 top-16 z-30 max-w-xs rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800 shadow-lg">
              Click inside the PDF viewer and press Ctrl+F (or ⌘+F on Mac) to
              search
              <button
                type="button"
                onClick={() => setSearchVisible(false)}
                className="absolute right-1 top-1 text-yellow-700 hover:text-yellow-900"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMobile ? (
            <button
              type="button"
              className={iconButtonClass}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Minimize" : "Enter fullscreen"}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </button>
          ) : (
            <button
              type="button"
              className={iconButtonClass}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </button>
          )}
          <button
            type="button"
            className={`${iconButtonClass} border-red-300/70 text-red-600 hover:bg-red-50`}
            onClick={onClose}
            title="Close"
          >
            <Close />
          </button>
        </div>
      </div>

      <div
        className={`${isFullscreen ? "mx-0 mb-0 mt-0 rounded-none border-x-0 border-b-0" : "mx-2 mb-2 mt-2 rounded-xl sm:mx-4"} relative flex-1 overflow-auto border border-border bg-white shadow-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-background/75 backdrop-blur-sm"
            >
              <CircularProgress style={{ color: "inherit" }} />
            </motion.div>
          )}
        </AnimatePresence>
        {url && (
          <iframe
            ref={iframeRef}
            key={`${url}-${reloadKey}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            src={url}
            allow="autoplay; fullscreen; downloads"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={() => setIsLoading(false)}
            className="h-full w-full border-0"
          />
        )}
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </motion.div>
  );
};

export default FileViewer;
