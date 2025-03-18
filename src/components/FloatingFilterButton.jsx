import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FilterList } from "@mui/icons-material";

const FloatingButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  left: 1.9rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${(props) => props.theme.gradient};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const FloatingFilterButton = ({ onClick }) => {
  return (
    <FloatingButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <FilterList />
    </FloatingButton>
  );
};

export default FloatingFilterButton;
