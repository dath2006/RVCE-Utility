import React from "react";
import {
  CircleMinus,
  Minimize2,
  Maximize2,
  X,
  Layout as LayoutSplit,
  RotateCcw,
} from "lucide-react";
import { useWindowContext } from "./WindowContext";

const WindowControls = ({
  windowId,
  currentState,
  onClose,
  onMinimize,
  onMaximize,
  onReload,
}) => {
  const { canOpenSplitView, setSplitView } = useWindowContext();
  const isSplitViewAvailable = canOpenSplitView();

  const handleSplitView = () => {
    if (!isSplitViewAvailable) return;
    setSplitView();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onReload}
        className="s-iconbtn"
        title="Reload"
      >
        <RotateCcw size={16} />
      </button>

      <button
        type="button"
        onClick={handleSplitView}
        disabled={!isSplitViewAvailable}
        className="s-iconbtn"
        title={
          isSplitViewAvailable
            ? "Open in split view"
            : "Keep exactly two active windows for split view"
        }
      >
        <LayoutSplit size={16} />
      </button>

      <button
        type="button"
        onClick={onMinimize}
        className="s-iconbtn"
        title="Minimize"
      >
        <CircleMinus size={16} />
      </button>

      <button
        type="button"
        onClick={onMaximize}
        className="s-iconbtn"
        title={currentState === "maximized" ? "Restore" : "Maximize"}
      >
        {currentState === "maximized" ? (
          <Minimize2 size={16} />
        ) : (
          <Maximize2 size={16} />
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="s-iconbtn s-iconbtn--danger"
        title="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default WindowControls;
