import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";

const ViewerContainer = styled(motion.div)`
  position: fixed;
  top: 60px; // Height of navbar
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) => props.theme.surface};
  z-index: 98;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  background: ${(props) => props.theme.surface};
  z-index: 98;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: ${(props) => props.theme.secondary};
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
  background: ${(props) => props.theme.surface};
  z-index: 100;
`;

const FileViewer = ({ url, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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
        <IconButton onClick={toggleFullscreen}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
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
        <StyledIframe src={url} allow="autoplay" allowFullScreen />
      </IframeContainer>
    </ViewerContainer>
  );
};

export default FileViewer;
