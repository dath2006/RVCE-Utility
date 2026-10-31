import React from "react";
import { useWindowContext } from "./WindowContext";
import { FileText } from "lucide-react";

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

  return (
    <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border/80 s-surface px-2 py-2 shadow-xl max-[925px]:bottom-20">
      {minimizedWindows.map((window) => (
        <button
          key={window.id}
          onClick={() => handleRestore(window)}
          className="group relative rounded-md"
          title={`Restore ${window.title}`}
        >
          <div
            className="flex items-center justify-center gap-2 overflow-hidden rounded-md border border-border bg-background/70 px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/70 hover:bg-accent"
          >
            <FileText className="h-4 w-4 text-primary" />
            <div className="max-w-[120px] truncate">
              {window.title.slice(0, 15)}
              {window.title.length > 15 ? "..." : ""}
            </div>
          </div>

          <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            {window.title}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MinimizedBar;
