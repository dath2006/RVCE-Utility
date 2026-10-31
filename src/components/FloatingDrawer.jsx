import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

const FloatingDrawer = ({ setShowWorkspace }) => {
  const { hideNavigation, activeOverlays } = useNavigation();

  // Hide if navigation should be hidden due to active overlays
  if (hideNavigation || activeOverlays.length > 0) return null;

  // Safe-area aware fixed container, rendered in a portal like the bottom bar
  return createPortal(
    <div
      className="left-3 fixed"
      style={{
        zIndex: 15, // Slightly above bottom bar but below modals
        left: "0.75rem",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)",
      }}
    >
      <motion.button
        type="button"
        onClick={() => setShowWorkspace(true)}
        className="s-iconbtn s-iconbtn--solid"
        style={{ width: "3rem", height: "3rem" }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open workspace"
        title="Open workspace"
      >
        <Layers className="h-5 w-5" />
      </motion.button>
    </div>,
    document.body,
  );
};

export default FloatingDrawer;
