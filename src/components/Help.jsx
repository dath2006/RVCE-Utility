import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import { HelpCircle } from "lucide-react";

const GradientAccent = styled.div`
  width: 100%;
  height: 7px;
  background: ${({ theme }) => theme.gradient};
  border-radius: 8px 8px 0 0;
  margin-bottom: 1.2rem;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const HelpCard = styled(motion.div)`
  background: ${({ theme }) => theme.glassbgc};
  padding: 2rem;
  border-radius: 18px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 30px ${({ theme }) => theme.shadow}22;
  border: 1.5px solid ${({ theme }) => theme.border};
  backdrop-filter: blur(12px);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s, transform 0.2s;

  &:hover {
    background: ${(props) => props.theme.primary};
    color: #fff;
    transform: scale(1.08);
  }
`;

const Content = styled.div`
  color: ${(props) => props.theme.text};
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 1.2rem;
`;

const Title = styled.h2`
  color: ${(props) => props.theme.primary};
  margin-bottom: 0.2rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const Subtitle = styled.div`
  color: ${({ theme }) => theme.text}bb;
  font-size: 1.02rem;
  margin-bottom: 0.7rem;
`;
const ThemedButton = styled(Button)`
  && {
    background: ${({ theme }) => theme.gradient};
    color: #fff;
    font-weight: 600;
    border-radius: 8px;
    box-shadow: 0 2px 8px ${({ theme }) => theme.primary}33;
    margin-top: 0.7rem;
    transition: background 0.2s, color 0.2s;
    &:hover {
      background: ${({ theme }) => theme.primary};
      color: #fff;
    }
  }
`;

const Help = ({ text, isOpen, url, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <HelpCard
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GradientAccent />
            <CloseButton onClick={onClose} aria-label="Close help">
              <Close />
            </CloseButton>
            <Title>
              <HelpCircle size={22} />
              Important Announcement
            </Title>
            <Subtitle>
              This section displays important or new announcement.
            </Subtitle>
            <Content>{text}</Content>
            <br />
            {url && (
              <ThemedButton
                onClick={() => {
                  window.open(url);
                }}
              >
                Check Out !
              </ThemedButton>
            )}
          </HelpCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default Help;
