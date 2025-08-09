import React, { createContext, useContext, useState, useCallback } from "react";

const BottomBarContext = createContext();

export const useBottomBar = () => {
  const context = useContext(BottomBarContext);
  if (!context) {
    throw new Error("useBottomBar must be used within a BottomBarProvider");
  }
  return context;
};

export const BottomBarProvider = ({ children }) => {
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [hiddenBy, setHiddenBy] = useState(new Set());

  const hideBottomBar = useCallback((componentId) => {
    setHiddenBy((prev) => {
      const newSet = new Set(prev);
      newSet.add(componentId);
      return newSet;
    });
    setIsBottomBarVisible(false);
  }, []);

  const showBottomBar = useCallback((componentId) => {
    setHiddenBy((prev) => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      // Only show bottom bar if no other components are hiding it
      if (newSet.size === 0) {
        setIsBottomBarVisible(true);
      }
      return newSet;
    });
  }, []);

  const forceShowBottomBar = useCallback(() => {
    setHiddenBy(new Set());
    setIsBottomBarVisible(true);
  }, []);

  const forceHideBottomBar = useCallback(() => {
    setIsBottomBarVisible(false);
  }, []);

  return (
    <BottomBarContext.Provider
      value={{
        isBottomBarVisible,
        hideBottomBar,
        showBottomBar,
        forceShowBottomBar,
        forceHideBottomBar,
        hiddenBy: Array.from(hiddenBy),
      }}
    >
      {children}
    </BottomBarContext.Provider>
  );
};

export default BottomBarContext;
