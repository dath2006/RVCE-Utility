import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";

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
`;

const HelpCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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

  &:hover {
    background: ${(props) => props.theme.secondary};
  }
`;

const Content = styled.div`
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  line-height: 1.6;
  margin-top: 1rem;
`;

const Title = styled.h2`
  color: ${(props) => props.theme.primary};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Help = ({ text, isOpen, url, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <HelpCard
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <Close />
            </CloseButton>
            <Title>Help Info</Title>
            <Content>{text}</Content>
            <br></br>
            {url && (
              <Button
                onClick={() => {
                  window.open(url);
                }}
              >
                Check Out !
              </Button>
            )}
          </HelpCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default Help;
