import React from "react";
import styled from "styled-components";
import { Search } from "@mui/icons-material";
import { RxCross1 } from "react-icons/rx";

const Container = styled.div`
  position: relative;
  width: 300px;
  display: flex;
  align-items: center;
  padding-right: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.text};
  opacity: 0.5;
`;

const SearchBar = ({ value, onChange }) => {
  return (
    <Container>
      <SearchIcon />
      <Input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <RxCross1 className="relative -left-8" onClick={() => onChange("")} />
      )}
    </Container>
  );
};

export default SearchBar;
