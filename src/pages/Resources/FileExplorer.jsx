import React, { useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import FileCard from "./FileCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileViewer from "../../components/FileViewer";
import { CheckCircle } from "@mui/icons-material";

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const Toast = styled(motion.div)`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const FileExplorer = ({
  currentPath,
  searchQuery,
  filteredFiles,
  onPathChange,
  rootFolders,
}) => {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("workspace");
    return saved ? JSON.parse(saved) : [];
  });
  const [viewerFile, setViewerFile] = useState(null);
  const [showToast, setShowToast] = useState(false);

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

  useEffect(() => {
    localStorage.setItem("workspace", JSON.stringify(files));
  }, [files]);

  const getCurrentFolder = () => {
    if (searchQuery) return filteredFiles;
    let current = rootFolders;
    for (const path of currentPath) {
      current = current.find((item) => item.name === path)?.children || [];
    }
    return current;
  };

  const currentFolder = getCurrentFolder();

  const onAddToWorkspace = (item) => {
    const exists = JSON.parse(localStorage.getItem("workspace"));
    if (exists && !exists.find((file) => file.id === item.id)) {
      item.parentName = currentPath[0];
      setFiles(() => [...exists, item]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const onView = (item) => {
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
    <>
      <Grid>
        {currentFolder.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            onNavigate={() => onPathChange([...currentPath, item.name])}
            onAddToWorkspace={onAddToWorkspace}
            onDownload={() => onDownload(item)}
            onView={onView}
          />
        ))}
      </Grid>

      <AnimatePresence>
        {viewerFile && (
          <FileViewer
            url={viewerFile.webViewLink}
            onClose={() => setViewerFile(null)}
          />
        )}
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
        {showToast && (
          <Toast
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle /> Added to workspace
          </Toast>
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
    })
  ).isRequired,
};

export default FileExplorer;
