import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import styled from "styled-components";
import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CachedIcon from "@mui/icons-material/Cached";

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
  padding: 0.5rem;
  background: ${(props) => props.theme.surface || "#f5f5f5"};
  z-index: 98;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text || "black"};
  padding: 0.5rem;
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
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Manage navigation history with more robust state
  const [navigationState, setNavigationState] = useState({
    history: [],
    currentIndex: -1,
  });

  // Synchronize history when URL changes
  useEffect(() => {
    if (url) {
      setNavigationState((prev) => {
        // Prevent duplicate entries
        const updatedHistory = prev.history.slice(0, prev.currentIndex + 1);

        // Only add if different from last entry
        if (
          !updatedHistory.length ||
          updatedHistory[updatedHistory.length - 1] !== url
        ) {
          updatedHistory.push(url);
        }

        return {
          history: updatedHistory,
          currentIndex: updatedHistory.length - 1,
        };
      });

      // Reset loading state
      setIsLoading(true);
    }
  }, [url]);

  // Memoized current URL for rendering
  const currentUrl = useMemo(() => {
    return navigationState.history[navigationState.currentIndex] || null;
  }, [navigationState.history, navigationState.currentIndex]);

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

  // Navigation handlers with improved logic
  const handleBackward = useCallback(() => {
    setNavigationState((prev) => {
      if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  const handleForward = useCallback(() => {
    setNavigationState((prev) => {
      if (prev.currentIndex < prev.history.length - 1) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
        };
      }
      return prev;
    });
  }, []);

  // Reload handler
  const handleReload = useCallback(() => {
    if (iframeRef.current && currentUrl) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  }, [currentUrl]);

  // Load handling
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

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
          <IconButton
            onClick={handleBackward}
            disabled={navigationState.currentIndex <= 0}
            style={{
              opacity: navigationState.currentIndex <= 0 ? 0.5 : 1,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={handleForward}
            disabled={
              navigationState.currentIndex >= navigationState.history.length - 1
            }
            style={{
              opacity:
                navigationState.currentIndex >=
                navigationState.history.length - 1
                  ? 0.5
                  : 1,
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
          <IconButton onClick={handleReload} disabled={isLoading}>
            <CachedIcon />
          </IconButton>
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
        {currentUrl && (
          <StyledIframe
            ref={iframeRef}
            key={currentUrl}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            src={currentUrl}
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
