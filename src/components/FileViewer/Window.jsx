import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWindowContext } from "./WindowContext";
import WindowControls from "./WindowControls";
import { Maximize2 } from "lucide-react";
import styled from "styled-components";
import WaveLoader from "../Loading";
import { motion } from "framer-motion";
import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const Window = ({ data }) => {
  const {
    updateWindowPosition,
    updateWindowState,
    removeWindow,
    activateWindow,
    setSplitView,
  } = useWindowContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [resizeType, setResizeType] = useState("none");
  const windowRef = useRef(null);
  const dragPositionRef = useRef({ x: data.position.x, y: data.position.y });
  const rafRef = useRef();
  const iframeRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Handle clicking anywhere on the window to activate it
  const handleWindowClick = (e) => {
    e.stopPropagation();
    activateWindow(data.id);
  };

  // Handle window close
  const handleClose = () => {
    removeWindow(data.id);
  };

  // Handle window minimize
  const handleMinimize = () => {
    updateWindowState(data.id, "minimized");
  };

  // Handle window maximize/restore
  const handleMaximize = () => {
    updateWindowState(
      data.id,
      data.state === "maximized" ? "normal" : "maximized"
    );
  };

  // Reload handler
  const handleReload = useCallback(() => {
    // Force iframe to reload by changing key
    setIframeKey((k) => k + 1);
  }, []);

  // Start dragging process
  const handleDragStart = (e) => {
    if (
      data.state === "maximized" ||
      data.state === "split-left" ||
      data.state === "split-right"
    ) {
      return;
    }

    e.preventDefault();
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      activateWindow(data.id);
      document.body.style.cursor = "grabbing";
    }
  };

  // Handle resize start
  const handleResizeStart = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeType(type);
    setIsResizing(true);
    document.body.style.cursor = getCursorStyle(type);
  };

  // Get cursor style based on resize type
  const getCursorStyle = (type) => {
    switch (type) {
      case "e":
      case "w":
        return "ew-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "nw":
      case "se":
        return "nwse-resize";
      default:
        return "default";
    }
  };

  // Handle mouse movement while dragging or resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        // Prevent dragging if mouse buttons are not pressed
        if (e.buttons === 0) {
          setIsDragging(false);
          document.body.style.cursor = "";
          return;
        }

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Calculate maximum offscreen amounts (40% of window size)
        const maxOffscreenX = size.width * 0.4;
        const maxOffscreenBottom = size.height * 0.4;

        dragPositionRef.current = {
          x: Math.max(
            -maxOffscreenX,
            Math.min(newX, window.innerWidth - size.width + maxOffscreenX)
          ),
          // Prevent dragging off the top, but allow 40% off the bottom
          y: Math.max(
            0,
            Math.min(
              newY,
              window.innerHeight - size.height + maxOffscreenBottom
            )
          ),
        };

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          updateWindowPosition(data.id, dragPositionRef.current);
        });
      } else if (isResizing) {
        // Prevent resizing if mouse buttons are not pressed
        if (e.buttons === 0) {
          setIsResizing(false);
          setResizeType("none");
          document.body.style.cursor = "";
          return;
        }

        const rect = windowRef.current?.getBoundingClientRect();
        if (!rect) return;

        let newWidth = size.width;
        let newHeight = size.height;
        let newX = data.position.x;
        let newY = data.position.y;

        switch (resizeType) {
          case "e":
            newWidth = e.clientX - rect.left;
            break;
          case "w":
            newWidth = rect.right - e.clientX;
            newX = e.clientX;
            break;
          case "s":
            newHeight = e.clientY - rect.top;
            break;
          case "n":
            newHeight = rect.bottom - e.clientY;
            newY = Math.max(0, e.clientY); // Prevent resizing above top of screen
            break;
          case "se":
            newWidth = e.clientX - rect.left;
            newHeight = e.clientY - rect.top;
            break;
          case "sw":
            newWidth = rect.right - e.clientX;
            newHeight = e.clientY - rect.top;
            newX = e.clientX;
            break;
          case "ne":
            newWidth = e.clientX - rect.left;
            newHeight = rect.bottom - e.clientY;
            newY = Math.max(0, e.clientY); // Prevent resizing above top of screen
            break;
          case "nw":
            newWidth = rect.right - e.clientX;
            newHeight = rect.bottom - e.clientY;
            newX = e.clientX;
            newY = Math.max(0, e.clientY); // Prevent resizing above top of screen
            break;
        }

        // Add bounds checking for resize
        const maxOffscreenX = size.width * 0.4;
        const maxOffscreenBottom = size.height * 0.4;

        newWidth = Math.max(
          400,
          Math.min(newWidth, window.innerWidth + maxOffscreenX)
        );
        newHeight = Math.max(
          300,
          Math.min(newHeight, window.innerHeight + maxOffscreenBottom)
        );
        newX = Math.max(
          -maxOffscreenX,
          Math.min(newX, window.innerWidth - 100)
        );
        newY = Math.max(0, Math.min(newY, window.innerHeight - 100));

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          setSize({ width: newWidth, height: newHeight });
          updateWindowPosition(data.id, { x: newX, y: newY });
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeType("none");
        document.body.style.cursor = "";

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    };

    const handleMouseLeave = () => {
      // Also handle when mouse leaves the window
      if (isDragging || isResizing) {
        handleMouseUp();
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.body.classList.add("select-none");
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.body.classList.remove("select-none");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, isResizing, dragOffset, data.id, resizeType, size]);

  // Render nothing if minimized
  if (data.state === "minimized") {
    return null;
  }

  // Determine window position and size classes based on state
  let positionStyle = {};
  let sizeClasses = "";

  switch (data.state) {
    case "maximized":
      positionStyle = { top: 0, left: 0, right: 0, bottom: 0 };
      sizeClasses = "w-full h-full";
      break;
    case "split-left":
      positionStyle = {
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--split-position, 50%)",
      };
      sizeClasses = "h-full";
      break;
    case "split-right":
      positionStyle = {
        top: 0,
        right: 0,
        bottom: 0,
        width: "calc(100% - var(--split-position, 50%))",
      };
      sizeClasses = "h-full";
      break;
    default:
      positionStyle = {
        top: `${data.position.y}px`,
        left: `${data.position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: isDragging ? "scale(1.01)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.2s ease-out",
      };
  }

  const windowStyle = {
    ...positionStyle,
    zIndex: data.isActive ? 9999 : data.zIndex,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeInOut", damping: 20 }}
      ref={windowRef}
      className={`absolute bg-white rounded-lg shadow-xl overflow-hidden flex flex-col 
                  ${sizeClasses} 
                  ${data.isActive ? "ring-2 ring-blue-400" : ""}`}
      style={windowStyle}
      onClick={handleWindowClick}
    >
      {/* Window Header */}
      <div
        className={`px-6 py-1 select-none 
                   flex items-center justify-between border-b border-gray-200
                   cursor-grab active:cursor-grabbing ${
                     localStorage.getItem("theme") === "dark"
                       ? "bg-gray-800 text-white"
                       : "bg-gradient-to-r from-gray-50 to-gray-100  text-gray-800"
                   }`}
        onMouseDown={handleDragStart}
      >
        <h3 className="text-lg font-medium  truncate">{data.title}</h3>
        <WindowControls
          windowId={data.id}
          currentState={data.state}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onReload={handleReload}
        />
      </div>

      {/* Window Content */}

      <div className="flex-1 overflow-hidden bg-gray-50 relative">
        <iframe
          key={data.contentId + "-" + iframeKey}
          src={data.content}
          title={data.title}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          allow="autoplay; fullscreen;"
          allowFullScreen
        />

        {/* Click overlay when window is not active */}
        {!data.isActive && (
          <div
            className="absolute inset-0 bg-black/5 transition-opacity"
            onClick={handleWindowClick}
          />
        )}
      </div>

      {/* Resize handles */}
      {data.state === "normal" && (
        <>
          <div
            className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute top-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute bottom-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute left-0 top-1/2 w-2 h-8 -translate-y-1/2 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute right-0 top-1/2 w-2 h-8 -translate-y-1/2 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </motion.div>
  );
};

export default Window;
