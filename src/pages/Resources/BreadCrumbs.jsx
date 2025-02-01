import React from "react";
import styled from "styled-components";
import { NavigateNext } from "@mui/icons-material";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
`;

const Crumb = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.isLast ? props.theme.primary : props.theme.text)};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;

  &:hover {
    background: ${(props) => props.theme.secondary};
  }
`;

const BreadCrumbs = ({ path, onNavigate }) => {
  const handleClick = (index) => {
    onNavigate(path.slice(0, index + 1));
  };

  return (
    <Container>
      <Crumb onClick={() => onNavigate([])}>Home</Crumb>
      {path.map((item, index) => (
        <React.Fragment key={index}>
          <NavigateNext />
          <Crumb
            isLast={index === path.length - 1}
            onClick={() => handleClick(index)}
          >
            {item}
          </Crumb>
        </React.Fragment>
      ))}
    </Container>
  );
};

export default BreadCrumbs;
