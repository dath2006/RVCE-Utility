import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import { FilterList } from "@mui/icons-material";
import { useNavigation } from "../contexts/NavigationContext";

const drawerItems = [
  { icon: WorkspacesIcon, label: "Workspace" },
  // { icon: FilterList, label: "Filter" },
];

const FloatingDrawer = ({ setShowWorkspace, isOpen, setIsOpen }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { hideNavigation } = useNavigation();

  // Hide if navigation should be hidden due to active overlays
  if (hideNavigation) return null;

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
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
        whilehover={{ scale: 1.05 }}
        whiletap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp size={24} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-4"
          >
            <div className="flex flex-col-reverse gap-2">
              {drawerItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="relative"
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  <motion.div
                    className="relative flex items-center"
                    whilehover={{ scale: 1.05 }}
                    whiletap={{ scale: 0.95 }}
                  >
                    <motion.button
                      className={`w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-200`}
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                        background:
                          hoveredIndex === index
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 255, 255, 0.1)",
                      }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        if (item.label === "Workspace") {
                          setShowWorkspace(true);
                        }
                      }}
                    >
                      <item.icon size={20} />
                    </motion.button>

                    <AnimatePresence>
                      {hoveredIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-full ml-3 whitespace-nowrap pointer-events-none"
                        >
                          <div
                            className={`bg-white/10 backdrop-blur-lg px-3 py-1.5 rounded-full text-sm font-medium shadow-lg border border-white/20`}
                          >
                            {item.label}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="absolute inset-0 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: hoveredIndex === index ? 0.5 : 0,
                        scale: hoveredIndex === index ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default FloatingDrawer;
