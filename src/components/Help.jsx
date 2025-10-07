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
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px ${({ theme }) => theme.shadow}22;
  border: 1.5px solid ${({ theme }) => theme.border};
  backdrop-filter: blur(12px);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.secondary};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary};
    border-radius: 10px;
    transition: background 0.2s;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primaryDark || theme.primary};
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    width: 98%;
    max-width: 98%;
    max-height: 92vh;
    padding: 1.25rem;
    border-radius: 12px;
  }

  @media (max-height: 600px) {
    max-height: 95vh;
    padding: 1rem;
  }
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
  z-index: 10;

  &:hover {
    background: ${(props) => props.theme.primary};
    color: #fff;
    transform: scale(1.08);
  }

  @media (max-width: 480px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem;
  }
`;

const Content = styled.div`
  color: ${(props) => props.theme.text};
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* Styling for HTML content */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${(props) => props.theme.primary};
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  h4 {
    font-size: 1.15rem;

    @media (max-width: 768px) {
      font-size: 1.05rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }

  p {
    margin-bottom: 0.75rem;
  }

  a {
    color: ${(props) => props.theme.primary};
    text-decoration: underline;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme.primaryDark};
    }
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;

    @media (max-width: 480px) {
      margin-left: 1rem;
    }
  }

  li {
    margin-bottom: 0.3rem;
  }

  strong,
  b {
    font-weight: 600;
    color: ${(props) => props.theme.text};
  }

  em,
  i {
    font-style: italic;
  }

  code {
    background: ${(props) => props.theme.secondary};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: "Courier New", monospace;
    font-size: 0.95rem;

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }

  pre {
    background: ${(props) => props.theme.secondary};
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 0.75rem;

    @media (max-width: 480px) {
      padding: 0.75rem;
    }
  }

  blockquote {
    border-left: 4px solid ${(props) => props.theme.primary};
    padding-left: 1rem;
    margin-left: 0;
    font-style: italic;
    color: ${(props) => props.theme.text}cc;

    @media (max-width: 480px) {
      padding-left: 0.75rem;
      border-left-width: 3px;
    }
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.5rem 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${(props) => props.theme.border};
    margin: 1rem 0;
  }
`;

const Title = styled.h2`
  color: ${(props) => props.theme.primary};
  margin-bottom: 0.2rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;
const Subtitle = styled.div`
  color: ${({ theme }) => theme.text}bb;
  font-size: 1.02rem;
  margin-bottom: 0.7rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
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
  // Check if text contains HTML tags
  const isHTML = /<[a-z][\s\S]*>/i.test(text);

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
            {isHTML ? (
              <Content dangerouslySetInnerHTML={{ __html: text }} />
            ) : (
              <Content>{text}</Content>
            )}
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
