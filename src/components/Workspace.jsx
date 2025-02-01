import React, { useEffect } from "react";
import styled from "styled-components";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Description,
  Close,
  GetApp,
  Fullscreen,
  Visibility,
} from "@mui/icons-material";
import FileViewer from "./FileViewer";

const WorkspaceContainer = styled.div`
  position: fixed;
  bottom: ${(props) => (props.isOpen ? "0" : "-400px")};
  left: 0;
  right: 0;
  height: 400px;
  background: ${(props) => props.theme.surface};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease;
  z-index: 99;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.secondary};
    border-radius: 4px;
    opacity: 0;
  }

  &:hover::-webkit-scrollbar-thumb {
    opacity: 1;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.border};
`;

const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;

  @media (min-width: 540px) {
    height: 100px;
  }

  @media (max-width: 540px) {
    height: 100px;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: filter 0.3s ease;
  ${(props) =>
    props.isBlurred &&
    `
    filter: blur(2px);
    opacity: 0.7;
  `}
`;

const SubjectBadge = styled.div`
  position: absolute;
  top: -0.1rem;
  right: 0.5rem;
  background: ${(props) => props.theme.primary}33;
  color: ${(props) => props.theme.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
`;

const ActionOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) => props.theme.surface}CC;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
`;

const IconButton = styled(motion.button)`
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.accent};
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  height: calc(100% - 60px);

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.secondary}66;
    border-radius: 3px;
  }
`;

const DownloadStatus = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: ${(props) => props.theme.surface};
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
`;

const Spinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid ${(props) => props.theme.primary};
  border-top-color: transparent;
  border-radius: 50%;
`;

const WorkspaceCard = ({ file, onRemove, onView, onDownload }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Content isBlurred={showActions}>
        <Description />
        <span>{file.name}</span>
      </Content>

      <SubjectBadge>{file.parentName}</SubjectBadge>

      <AnimatePresence>
        {showActions && (
          <ActionOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IconButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
            >
              <Close />
            </IconButton>
            <IconButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(file);
              }}
            >
              <GetApp />
            </IconButton>
            <IconButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onView(file);
              }}
            >
              <Visibility />
            </IconButton>
          </ActionOverlay>
        )}
      </AnimatePresence>
    </Card>
  );
};

const Workspace = ({ onClose, setViewerFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("workspace");
    return saved ? JSON.parse(saved) : [];
  });
  const [downloadStatus, setDownloadStatus] = useState(null);

  useEffect(() => {
    let timeoutId;
    if (downloadStatus === "ready") {
      timeoutId = setTimeout(() => {
        setDownloadStatus(null);
      }, 3000); // Close after 3 seconds when ready
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [downloadStatus]);

  const handleRemoveFile = (id) => {
    setFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== id);
      localStorage.setItem("workspace", JSON.stringify(newFiles));
      return newFiles;
    });
  };

  const handleClearAll = () => {
    localStorage.setItem("workspace", "[]");
    setFiles([]);
  };

  const onView = (item) => {
    onClose();
    setViewerFile(item);
  };

  const onDownload = async (item) => {
    try {
      // Show preparing status
      setDownloadStatus("preparing");

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.src = item.webContentLink;
      // Update status and trigger download
      setTimeout(() => {
        setDownloadStatus("ready");
      }, 4000);

      // Cleanup
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadStatus(null);
    }
  };

  return (
    <WorkspaceContainer isOpen={isOpen}>
      <Header>
        <h3>Workspace</h3>
        <div className="flex gap-2">
          <div
            onClick={handleClearAll}
            className="flex items-center px-4 mr-6 border border-red-400  hover:bg-red-400  py-1 rounded-full cursor-pointer"
          >
            Clear All
          </div>
          <IconButton
            onClick={() => {
              onClose();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? <Close /> : <Fullscreen />}
          </IconButton>
        </div>
      </Header>
      <FileGrid>
        {files.map((file) => (
          <WorkspaceCard
            key={file.id}
            file={file}
            onRemove={handleRemoveFile}
            onView={onView}
            onDownload={onDownload}
          />
        ))}
      </FileGrid>
      <AnimatePresence>
        {downloadStatus && (
          <DownloadStatus
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {downloadStatus === "preparing" && (
              <>
                <Spinner
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Preparing download...</span>
              </>
            )}
            {downloadStatus === "ready" && (
              <>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  ✓
                </motion.span>
                <span>Download ready!</span>
              </>
            )}
          </DownloadStatus>
        )}
      </AnimatePresence>
    </WorkspaceContainer>
  );
};

export default Workspace;
