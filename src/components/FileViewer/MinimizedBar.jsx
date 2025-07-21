import React from "react";
import { useWindowContext } from "./WindowContext";
import { Maximize } from "lucide-react";
import { Description } from "@mui/icons-material";

const MinimizedBar = () => {
  const { windows, updateWindowState, activateWindow } = useWindowContext();

  // Filter only minimized windows
  const minimizedWindows = windows.filter(
    (window) => window.state === "minimized"
  );

  // No minimized windows, don't render the bar
  if (minimizedWindows.length === 0) {
    return null;
  }

  const handleRestore = (window) => {
    updateWindowState(window.id, "normal");
    activateWindow(window.id);
  };

  return (
    <div className="fixed bottom-6 max-[925px]:bottom-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-50">
      {minimizedWindows.map((window) => (
        <button
          key={window.id}
          onClick={() => handleRestore(window)}
          className="group relative"
          title={`Restore ${window.title}`}
        >
          {/* Animated minimized window card */}
          <div
            className={`p-3 rounded-xl shadow-lg hover:shadow-2xl 
                        transform hover:-translate-y-1 transition-all duration-200
                        flex items-center justify-center overflow-hidden
                        border-2 border-transparent hover:border-blue-400 ${
                          localStorage.getItem("theme") === "dark"
                            ? "bg-gray-800"
                            : "bg-white text-gray-500"
                        }`}
          >
            {/* Icon based on file type */}
            <Description
              className="text-indigo-400"
              style={{ fontSize: "1rem" }}
            />
            {/* Window title */}
            <div className="text-xs font-medium truncate px-2">
              {window.title.slice(0, 15)}
              {window.title.length > 15 ? "..." : ""}
            </div>
          </div>

          {/* Hover tooltip */}
          <div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                        bg-gray-900 text-white text-xs py-1 px-2 rounded
                        opacity-0 group-hover:opacity-100 transition-opacity
                        whitespace-nowrap pointer-events-none"
          >
            {window.title}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MinimizedBar;
