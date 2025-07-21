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
}) => {
  const [showActions, setShowActions] = useState(false);
  const isFolder = item.mimeType === "application/vnd.google-apps.folder";

  const handleClick = () => {
    if (isFolder) {
      onNavigate();
    } else {
      setShowActions(true);
    }
  };

  return (
    <Card
      whilehover={{ scale: 1.02 }}
      whiletap={{ scale: 0.98 }}
      onClick={handleClick}
      onMouseEnter={() => !isFolder && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Content isblurred={showActions}>
        {isFolder ? <Folder /> : <Description />}
        <span>{item.name}</span>
      </Content>

      {item.path && (
        <SubjectBadge>
          {["ESC", "PLC", "ETC"].includes(item.path[0].split(" ")[0])
            ? item.path[1]
            : item.path[0]}
        </SubjectBadge>
      )}

      <AnimatePresence>
        {!isFolder && showActions && (
          <ActionOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IconButton
              whilehover={{ scale: 1.1 }}
              whiletap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWorkspace(item);
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
