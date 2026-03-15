import { createPortal } from "react-dom";

const ContributionModalPortal = ({ children }) => {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
};

export default ContributionModalPortal;
