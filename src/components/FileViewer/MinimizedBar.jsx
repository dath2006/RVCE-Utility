import React from "react";
import { useWindowContext } from "./WindowContext";
import { Description } from "@mui/icons-material";

const MinimizedBar = () => {
  const { windows, updateWindowState, activateWindow } = useWindowContext();

  // Filter only minimized windows
  const minimizedWindows = windows.filter(
    (window) => window.state === "minimized",
  );

  // No minimized windows, don't render the bar
  if (minimizedWindows.length === 0) {
    return null;
  }

  const handleRestore = (window) => {
    updateWindowState(window.id, "normal");
    activateWindow(window.id);
  };

  const isDark = localStorage.getItem("theme") === "dark";

  return (
    <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/80 bg-background/92 px-2 py-2 shadow-xl backdrop-blur-md max-[925px]:bottom-20">
      {minimizedWindows.map((window) => (
        <button
          key={window.id}
          onClick={() => handleRestore(window)}
          className="group relative rounded-full"
          title={`Restore ${window.title}`}
        >
          <div
            className={`flex items-center justify-center gap-2 overflow-hidden rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-md ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-200"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <Description
              className="text-indigo-500"
              style={{ fontSize: "0.95rem" }}
            />
            <div className="max-w-[120px] truncate">
              {window.title.slice(0, 15)}
              {window.title.length > 15 ? "..." : ""}
            </div>
          </div>

          <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {window.title}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MinimizedBar;
