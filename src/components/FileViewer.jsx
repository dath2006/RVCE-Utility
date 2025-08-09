import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";

const ViewerContainer = styled(motion.div)`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) => props.theme.surface || "#f5f5f5"};
  z-index: 98;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  background: ${(props) => props.theme.surface || "#f5f5f5"};
  z-index: 98;
  border-bottom: 1px solid ${(props) => props.theme.border || "#e0e0e0"};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text || "black"};
  padding: 0.375rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;

  &:hover {
    background: ${(props) =>
      !props.disabled && (props.theme.secondary || "rgba(0,0,0,0.1)")};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const IframeContainer = styled.div`
  position: relative;
  background: white;
  flex: 1;
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  background: white;
`;

const LoadingContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.theme.surface || "rgba(255,255,255,0.8)"};
  z-index: 100;
`;

const FileViewer = ({ url, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Reset loading state when URL changes
  useEffect(() => {
    if (url) {
      setIsLoading(true);
    }
  }, [url]);

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
    if (iframeRef.current && url) {
      setIsLoading(true);
      iframeRef.current.src = url;
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

  return (
    <ViewerContainer
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      ref={containerRef}
    >
      <ControlBar>
        <div className="flex">
          <IconButton onClick={handleReload} disabled={isLoading}>
            <CachedIcon />
          </IconButton>
          <IconButton onClick={triggerSearch} disabled={isLoading}>
            <SearchIcon />
          </IconButton>
          {searchVisible && (
            <div className="absolute top-14  bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded shadow-lg z-20 max-w-xs">
              Click inside the PDF viewer and press Ctrl+F (or ⌘+F on Mac) to
              search
              <button
                onClick={() => setSearchVisible(false)}
                className="absolute top-1 right-1 text-yellow-700 hover:text-yellow-900"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex">
          <IconButton onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </ControlBar>
      <IframeContainer onClick={(e) => e.stopPropagation()}>
        <AnimatePresence>
          {isLoading && (
            <LoadingContainer
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CircularProgress style={{ color: "inherit" }} />
            </LoadingContainer>
          )}
        </AnimatePresence>
        {url && (
          <StyledIframe
            ref={iframeRef}
            key={url}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            src={url}
            allow="autoplay; fullscreen; downloads"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={() => setIsLoading(false)}
          />
        )}
      </IframeContainer>
    </ViewerContainer>
  );
};

export default FileViewer;
