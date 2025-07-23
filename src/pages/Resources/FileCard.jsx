import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  Folder,
  Description,
  Add,
  GetApp,
  Visibility,
} from "@mui/icons-material";
import { useState } from "react";

const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: filter 0.3s ease;
  ${(props) =>
    props.isblurred &&
    `
    filter: blur(2px);
    opacity: 0.7;
  `}
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

const FileCard = ({
  item,
  onNavigate,
  onAddToWorkspace,
  onView,
  onDownload,
  activeCardId,
  setActiveCardId,
}) => {
  const isFolder = item.mimeType === "application/vnd.google-apps.folder";

  // Mobile detection
  const isMobile = typeof window !== "undefined" && "ontouchstart" in window;

  const showActions = activeCardId === item.id;

  const handleClick = (e) => {
    if (isFolder) {
      onNavigate();
    } else {
      if (isMobile) {
        setActiveCardId(showActions ? null : item.id);
      } else {
        setActiveCardId(item.id);
      }
    }
  };

  // Close overlay on mobile if user taps outside the overlay
  React.useEffect(() => {
    if (!isMobile || !showActions) return;
    const handleTouch = (e) => {
      if (!e.target.closest(".file-card-action-area")) {
        setActiveCardId(null);
      }
    };
    document.addEventListener("touchstart", handleTouch);
    return () => document.removeEventListener("touchstart", handleTouch);
  }, [isMobile, showActions, setActiveCardId]);

  return (
    <Card
      className="file-card-action-area"
      whilehover={!isMobile ? { scale: 1.02 } : undefined}
      whiletap={{ scale: 0.98 }}
      onClick={handleClick}
      onMouseEnter={
        !isMobile ? () => !isFolder && setActiveCardId(item.id) : undefined
      }
      onMouseLeave={!isMobile ? () => setActiveCardId(null) : undefined}
    >
      <Content isblurred={showActions}>
        {isFolder ? <Folder /> : <Description />}
        <span>{item.name}</span>
      </Content>

      {item.path && (
        <SubjectBadge>
          {["ESC", "PLC", "ETC"].includes(item.path[2].split(" ")[0])
            ? item.path[3]
            : item.path[2]}
        </SubjectBadge>
      )}

      <AnimatePresence>
        {!isFolder && showActions && (
          <ActionOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isMobile ? (e) => e.stopPropagation() : undefined}
          >
            <IconButton
              whilehover={{ scale: 1.1 }}
              whiletap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWorkspace(item);
                if (isMobile) setActiveCardId(null);
              }}
            >
              <Add />
            </IconButton>
            <IconButton
              whilehover={{ scale: 1.1 }}
              whiletap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onView(item);
                if (isMobile) setActiveCardId(null);
              }}
            >
              <Visibility />
            </IconButton>
            <IconButton
              whilehover={{ scale: 1.1 }}
              whiletap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(item);
                if (isMobile) setActiveCardId(null);
              }}
            >
              <GetApp />
            </IconButton>
          </ActionOverlay>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FileCard;
