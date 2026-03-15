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
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-blue-500"
        title="Reload"
      >
        <RotateCcw size={18} />
      </button>

      <button
        type="button"
        onClick={handleSplitView}
        disabled={!isSplitViewAvailable}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-45"
        title={
          isSplitViewAvailable
            ? "Open in split view"
            : "Keep exactly two active windows for split view"
        }
      >
        <LayoutSplit size={18} />
      </button>

      <button
        type="button"
        onClick={onMinimize}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-amber-500"
        title="Minimize"
      >
        <CircleMinus size={18} />
      </button>

      <button
        type="button"
        onClick={onMaximize}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-indigo-600"
        title={currentState === "maximized" ? "Restore" : "Maximize"}
      >
        {currentState === "maximized" ? (
          <Minimize2 size={18} />
        ) : (
          <Maximize2 size={18} />
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
        title="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default WindowControls;
