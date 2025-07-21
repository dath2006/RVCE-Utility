import React, { createContext, useState, useContext, useEffect } from "react";

const WindowContext = createContext(undefined);

export const WindowProvider = ({ children }) => {
  const [windows, setWindows] = useState(() => {
    const savedWindows = localStorage.getItem("windows");
    return savedWindows ? JSON.parse(savedWindows) : [];
  });
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  useEffect(() => {
    localStorage.setItem("windows", JSON.stringify(windows));
  }, [windows]);

  const getActiveWindows = () => {
    return windows.filter((window) => window.state !== "minimized");
  };

  const getAllWindowsId = () => {
    return windows.map((window) => {
      return window.contentId;
    });
  };

  const getActiveWindowCount = () => {
    return getActiveWindows().length;
  };

  const addWindow = (title, content, contentId) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);

    const newWindow = {
      id: Date.now().toString(),
      title,
      content,
      contentId,
      state: "normal",
      position: { x: 50, y: 50 },
      size: { width: "80%", height: "80%" },
      isActive: true,
      zIndex: newZIndex,
    };

    setWindows((prev) => {
      // Set all other windows as inactive
      const updatedWindows = prev.map((window) => ({
        ...window,
        isActive: false,
      }));

      return [...updatedWindows, newWindow];
    });

    setActiveWindowId(newWindow.id);
  };

  const removeWindow = (id) => {
    setWindows((prev) => prev.filter((window) => window.id !== id));

    // If we're removing the active window, set a new active window
    if (activeWindowId === id) {
      const remainingWindows = windows.filter((window) => window.id !== id);
      if (remainingWindows.length > 0) {
        setActiveWindowId(remainingWindows[remainingWindows.length - 1].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const updateWindowState = (id, state) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          // If entering split view, need to handle other windows
          if (state === "split-left" || state === "split-right") {
            return { ...window, state, isActive: true };
          }
          return { ...window, state };
        }

        // If a window is going into split mode, adjust other windows
        if (
          (state === "split-left" || state === "split-right") &&
          window.id !== id
        ) {
          const otherSplitState =
            state === "split-left" ? "split-right" : "split-left";

          // If there's exactly one other active window, put it in the opposite split position
          const activeWindows = getActiveWindows();
          if (
            activeWindows.length === 2 &&
            activeWindows.some((w) => w.id === id)
          ) {
            const otherWindow = activeWindows.find((w) => w.id !== id);
            if (otherWindow) {
              return {
                ...window,
                state:
                  window.id === otherWindow.id ? otherSplitState : window.state,
              };
            }
          }
        }

        return window;
      })
    );
  };

  const updateWindowPosition = (id, position) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id ? { ...window, position } : window
      )
    );
  };

  const activateWindow = (id) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);

    setWindows((prev) =>
      prev.map((window) => ({
        ...window,
        isActive: window.id === id,
        zIndex: window.id === id ? newZIndex : window.zIndex,
      }))
    );

    setActiveWindowId(id);
  };

  const canOpenSplitView = () => {
    const activeWindows = getActiveWindows();
    return activeWindows.length == 2;
  };

  const setSplitView = () => {
    const activeWindows = getActiveWindows();

    if (activeWindows.length === 1) {
      // If only one window is active, prompt to open another
      console.log("Only one window is active. Open another to use split view.");
    } else if (activeWindows.length === 2) {
      // Set the two active windows to split view
      setWindows((prev) =>
        prev.map((window, index) => {
          if (window.state !== "minimized") {
            return {
              ...window,
              state: index % 2 === 0 ? "split-left" : "split-right",
              position: { x: 0, y: 0 },
            };
          }
          return window;
        })
      );
    }
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        setWindows,
        activeWindowId,
        getAllWindowsId,
        addWindow,
        removeWindow,
        updateWindowState,
        updateWindowPosition,
        activateWindow,
        getActiveWindows,
        getActiveWindowCount,
        canOpenSplitView,
        setSplitView,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error("useWindowContext must be used within a WindowProvider");
  }
  return context;
};
