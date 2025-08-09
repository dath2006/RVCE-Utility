import React, { createContext, useContext, useState, useCallback } from "react";

// Context for managing navigation visibility
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [hideNavigation, setHideNavigation] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState(new Set());

  // Register an overlay as active
  const registerOverlay = useCallback((overlayId) => {
    setActiveOverlays((prev) => {
      const newSet = new Set(prev);
      newSet.add(overlayId);
      return newSet;
    });
    setHideNavigation(true);
  }, []);

  // Unregister an overlay
  const unregisterOverlay = useCallback((overlayId) => {
    setActiveOverlays((prev) => {
      const newSet = new Set(prev);
      newSet.delete(overlayId);

      // Only show navigation if no overlays are active
      if (newSet.size === 0) {
        setHideNavigation(false);
      }

      return newSet;
    });
  }, []);

  // Force hide/show navigation (for special cases)
  const forceHideNavigation = useCallback((hide) => {
    setHideNavigation(hide);
  }, []);

  const value = {
    hideNavigation,
    activeOverlays: Array.from(activeOverlays),
    registerOverlay,
    unregisterOverlay,
    forceHideNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to use navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

// Hook for overlays to auto-register/unregister
export const useOverlay = (overlayId, isActive) => {
  const { registerOverlay, unregisterOverlay } = useNavigation();

  React.useEffect(() => {
    if (isActive) {
      registerOverlay(overlayId);
    } else {
      unregisterOverlay(overlayId);
    }

    // Cleanup on unmount
    return () => {
      unregisterOverlay(overlayId);
    };
  }, [isActive, overlayId, registerOverlay, unregisterOverlay]);
};
