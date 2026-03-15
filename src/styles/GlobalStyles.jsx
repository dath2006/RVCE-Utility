import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  button {
    font-family: inherit;
  }
`;

export default GlobalStyles;

