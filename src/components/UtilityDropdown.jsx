import React, { useState } from "react";
import { GitHub } from "@mui/icons-material";
import { ListTodo } from "lucide-react";
import { SiOpenai, SiNotion } from "react-icons/si";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const DropdownMenu = styled(motion.div)`
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 12rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px ${(props) => props.theme.shadow};
  overflow: hidden;
  z-index: 1000;
`;

const UtilityDropdown = ({ showTodoMenu, setShowTodoMenu, isDarkMode }) => {
  const utilityItems = [
    { icon: SiOpenai, label: "ChatGPT", href: "https://chat.openai.com" },
    {
      icon: GitHub,
      label: "GitHub",
      href: "https://github.com/dath2006/RVCE-Utility",
    },
    { icon: SiNotion, label: "Notion", href: "https://www.notion.so/" },
    { icon: ListTodo, label: "Todo List", action: "todo" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleItemClick = (item) => {
    if (item.action === "todo") {
      setShowTodoMenu(!showTodoMenu);
    } else if (item.href) {
      window.open(item.href, "_blank", "noopener noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className="absolute  mt-4 z-50"
    >
      <div className="relative">
        {/* Floating dock background */}
        <motion.div
          className={`absolute inset-0 backdrop-blur-md rounded-2xl border border-white/10 ${
            isDarkMode ? " bg-zinc-800" : " bg-slate-500"
          }`}
          layoutId="dock-background"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />

        {/* Icons container */}
        <motion.div
          className="relative flex items-center gap-1 px-2 py-2"
          layout
        >
          {utilityItems.map((item, index) => (
            <motion.div
              key={index}
              className="relative"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => handleItemClick(item)}
            >
              <motion.div
                className="relative z-10 p-2"
                animate={{
                  scale: hoveredIndex === index ? 1.2 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <motion.div
                  className={`rounded-full p-2 transition-colors ${
                    hoveredIndex === index
                      ? "bg-white text-slate-800"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <item.icon size={24} />
                </motion.div>

                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap"
                    >
                      <div className="bg-white text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        {item.label}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Glow effect */}
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-0 -z-10 blur-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UtilityDropdown;
