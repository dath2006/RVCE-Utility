import { useEffect, useRef } from "react";
import { useBottomBar } from "../contexts/BottomBarContext";

/**
 * Custom hook to manage bottom bar visibility for modal/popup components
 * @param {boolean} isVisible - Whether the modal/popup is currently visible
 * @param {string} componentId - Unique identifier for the component (optional)
 * @returns {object} - Object with methods to manually control bottom bar
 */
export const useBottomBarVisibility = (isVisible, componentId) => {
  const { hideBottomBar, showBottomBar } = useBottomBar();
  const componentIdRef = useRef(
    componentId || `component-${Math.random().toString(36).substr(2, 9)}`
  );
  const currentComponentId = componentIdRef.current;

  // Store functions in refs to avoid dependency issues
  const hideBottomBarRef = useRef(hideBottomBar);
  const showBottomBarRef = useRef(showBottomBar);

  // Update refs when functions change
  hideBottomBarRef.current = hideBottomBar;
  showBottomBarRef.current = showBottomBar;

  useEffect(() => {
    try {
      if (isVisible) {
        hideBottomBarRef.current(currentComponentId);
      } else {
        showBottomBarRef.current(currentComponentId);
      }
    } catch (error) {
      console.error(
        `❌ Error in useBottomBarVisibility for ${currentComponentId}:`,
        error
      );
    }

    // Cleanup on unmount
    return () => {
      try {
        showBottomBarRef.current(currentComponentId);
      } catch (error) {
        console.error(`❌ Error in cleanup for ${currentComponentId}:`, error);
      }
    };
  }, [isVisible, currentComponentId]); // Only depend on isVisible and componentId

  return {
    hideBottomBar: () => hideBottomBar(currentComponentId),
    showBottomBar: () => showBottomBar(currentComponentId),
    componentId: currentComponentId,
  };
};

export default useBottomBarVisibility;
