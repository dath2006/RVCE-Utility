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
  const [isSplitView, setIsSplitView] = React.useState(false);

  const handleSplitView = () => {
    setSplitView();
  };

  return (
    <div className="flex flex-row flex-grow-0 items-center space-x-1">
      {/* Split View Button */}
      <div>
        {/* Reload Button */}
        <button
          onClick={onReload}
          className="p-1.5 text-gray-500 hover:text-blue-500 rounded"
          title="Reload"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={handleSplitView}
          onMouseEnter={() => setIsSplitView(true)}
          onMouseLeave={() => setIsSplitView(false)}
          className={`p-1.5 rounded hover:text-indigo-600 ${
            isSplitViewAvailable
              ? "text-blue-500"
              : "text-gray-400 cursor-not-allowed"
          }`}
          title={
            isSplitViewAvailable
              ? "Open in Split View"
              : "Open only two windows for split view"
          }
        >
          <LayoutSplit size={20} />
          {isSplitView && (
            <div
              className="absolute transform -translate-x-1/2 
                        bg-gray-900 text-white text-xs py-2 px-2 rounded 
                        group-hover:opacity-100 transition-opacity
                        whitespace-nowrap pointer-events-none z-50"
            >
              {isSplitViewAvailable
                ? "Open in Split View"
                : "Keep only two windows open for split view"}
            </div>
          )}
        </button>

        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          className="p-1.5 text-gray-500 hover:text-yellow-400 rounded"
          title="Minimize"
        >
          <CircleMinus size={20} />
        </button>

        {/* Maximize Button */}
        <button
          onClick={onMaximize}
          className="p-1.5 text-gray-500 hover:text-indigo-600 rounded"
          title={currentState === "maximized" ? "Restore" : "Maximize"}
        >
          {currentState === "maximized" ? (
            <Minimize2 size={20} />
          ) : (
            <Maximize2 size={20} />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500  hover:text-red-500 rounded"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default WindowControls;
