import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { useWindowContext } from "./WindowContext";
import WindowControls from "./WindowControls";

const getInitialSize = () => {
  if (typeof window === "undefined") {
    return { width: 820, height: 620 };
  }

  return {
    width: Math.min(Math.max(window.innerWidth * 0.72, 660), 1160),
    height: Math.min(Math.max(window.innerHeight * 0.72, 420), 780),
  };
};

const Window = ({ data }) => {
  const {
    updateWindowPosition,
    updateWindowState,
    removeWindow,
    activateWindow,
  } = useWindowContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(getInitialSize);
  const [resizeType, setResizeType] = useState("none");
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const windowRef = useRef(null);
  const dragPositionRef = useRef({ x: data.position.x, y: data.position.y });
  const rafRef = useRef();

  const handleWindowClick = (event) => {
    event.stopPropagation();
    activateWindow(data.id);
  };

  const handleClose = () => {
    removeWindow(data.id);
  };

  const handleMinimize = () => {
    updateWindowState(data.id, "minimized");
  };

  const handleMaximize = () => {
    updateWindowState(
      data.id,
      data.state === "maximized" ? "normal" : "maximized",
    );
  };

  const handleReload = useCallback(() => {
    setIsIframeLoading(true);
    setIframeKey((key) => key + 1);
  }, []);

  const handleDragStart = (event) => {
    if (
      data.state === "maximized" ||
      data.state === "split-left" ||
      data.state === "split-right"
    ) {
      return;
    }

    event.preventDefault();

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });

    setIsDragging(true);
    activateWindow(data.id);
    document.body.style.cursor = "grabbing";
  };

  const handleResizeStart = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeType(type);
    setIsResizing(true);
    document.body.style.cursor = getCursorStyle(type);
  };

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

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging) {
        if (event.buttons === 0) {
          setIsDragging(false);
          document.body.style.cursor = "";
          return;
        }

        const newX = event.clientX - dragOffset.x;
        const newY = event.clientY - dragOffset.y;

        const maxOffscreenX = size.width * 0.4;
        const maxOffscreenBottom = size.height * 0.4;

        dragPositionRef.current = {
          x: Math.max(
            -maxOffscreenX,
            Math.min(newX, window.innerWidth - size.width + maxOffscreenX),
          ),
          y: Math.max(
            0,
            Math.min(
              newY,
              window.innerHeight - size.height + maxOffscreenBottom,
            ),
          ),
        };

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          updateWindowPosition(data.id, dragPositionRef.current);
        });
      } else if (isResizing) {
        if (event.buttons === 0) {
          setIsResizing(false);
          setResizeType("none");
          document.body.style.cursor = "";
          return;
        }

        const rect = windowRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        let newWidth = size.width;
        let newHeight = size.height;
        let newX = data.position.x;
        let newY = data.position.y;

        switch (resizeType) {
          case "e":
            newWidth = event.clientX - rect.left;
            break;
          case "w":
            newWidth = rect.right - event.clientX;
            newX = event.clientX;
            break;
          case "s":
            newHeight = event.clientY - rect.top;
            break;
          case "n":
            newHeight = rect.bottom - event.clientY;
            newY = Math.max(0, event.clientY);
            break;
          case "se":
            newWidth = event.clientX - rect.left;
            newHeight = event.clientY - rect.top;
            break;
          case "sw":
            newWidth = rect.right - event.clientX;
            newHeight = event.clientY - rect.top;
            newX = event.clientX;
            break;
          case "ne":
            newWidth = event.clientX - rect.left;
            newHeight = rect.bottom - event.clientY;
            newY = Math.max(0, event.clientY);
            break;
          case "nw":
            newWidth = rect.right - event.clientX;
            newHeight = rect.bottom - event.clientY;
            newX = event.clientX;
            newY = Math.max(0, event.clientY);
            break;
          default:
            break;
        }

        const maxOffscreenX = size.width * 0.4;
        const maxOffscreenBottom = size.height * 0.4;

        newWidth = Math.max(
          420,
          Math.min(newWidth, window.innerWidth + maxOffscreenX),
        );
        newHeight = Math.max(
          300,
          Math.min(newHeight, window.innerHeight + maxOffscreenBottom),
        );
        newX = Math.max(
          -maxOffscreenX,
          Math.min(newX, window.innerWidth - 100),
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
      if (!isDragging && !isResizing) {
        return;
      }

      setIsDragging(false);
      setIsResizing(false);
      setResizeType("none");
      document.body.style.cursor = "";

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.classList.add("select-none");
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("select-none");

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    data.id,
    data.position.x,
    data.position.y,
    dragOffset.x,
    dragOffset.y,
    isDragging,
    isResizing,
    resizeType,
    size.height,
    size.width,
    updateWindowPosition,
  ]);

  if (data.state === "minimized") {
    return null;
  }

  let positionStyle = {};
  let sizeClasses = "";

  switch (data.state) {
    case "maximized":
      positionStyle = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
      sizeClasses = "h-full w-full rounded-none";
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
      break;
  }

  const isDark = localStorage.getItem("theme") === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      ref={windowRef}
      className={`absolute flex flex-col overflow-hidden border border-border/80 bg-background/95 shadow-2xl backdrop-blur-sm ${
        sizeClasses || "rounded-2xl"
      } ${data.isActive ? "ring-2 ring-primary/70" : "ring-1 ring-black/5"}`}
      style={{
        ...positionStyle,
        zIndex: data.isActive ? 9999 : data.zIndex,
      }}
      onClick={handleWindowClick}
    >
      <div
        className={`select-none border-b px-3 py-1.5 ${
          isDark
            ? "border-slate-700 bg-slate-900/90 text-slate-100"
            : "border-slate-200 bg-slate-50/90 text-slate-800"
        } flex cursor-grab items-center justify-between active:cursor-grabbing`}
        onMouseDown={handleDragStart}
      >
        <div className="min-w-0 pr-2">
          <h3 className="truncate text-sm font-semibold sm:text-base">
            {data.title}
          </h3>
        </div>

        <WindowControls
          windowId={data.id}
          currentState={data.state}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onReload={handleReload}
        />
      </div>

      <div className="relative flex-1 overflow-hidden bg-muted/20">
        {isIframeLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <iframe
          key={data.contentId + "-" + iframeKey}
          src={data.content}
          title={data.title}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          allow="autoplay; fullscreen;"
          allowFullScreen
          onLoad={() => setIsIframeLoading(false)}
          onError={() => setIsIframeLoading(false)}
        />

        {!data.isActive && (
          <div
            className="absolute inset-0 bg-black/5 transition-opacity"
            onClick={handleWindowClick}
          />
        )}
      </div>

      {data.state === "normal" && (
        <>
          <div
            className="absolute right-0 top-0 h-2 w-2 cursor-ne-resize"
            onMouseDown={(event) => handleResizeStart(event, "ne")}
          />
          <div
            className="absolute left-0 top-0 h-2 w-2 cursor-nw-resize"
            onMouseDown={(event) => handleResizeStart(event, "nw")}
          />
          <div
            className="absolute bottom-0 right-0 h-2 w-2 cursor-se-resize"
            onMouseDown={(event) => handleResizeStart(event, "se")}
          />
          <div
            className="absolute bottom-0 left-0 h-2 w-2 cursor-sw-resize"
            onMouseDown={(event) => handleResizeStart(event, "sw")}
          />
          <div
            className="absolute left-1/2 top-0 h-2 w-8 -translate-x-1/2 cursor-n-resize"
            onMouseDown={(event) => handleResizeStart(event, "n")}
          />
          <div
            className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 cursor-s-resize"
            onMouseDown={(event) => handleResizeStart(event, "s")}
          />
          <div
            className="absolute left-0 top-1/2 h-8 w-2 -translate-y-1/2 cursor-w-resize"
            onMouseDown={(event) => handleResizeStart(event, "w")}
          />
          <div
            className="absolute right-0 top-1/2 h-8 w-2 -translate-y-1/2 cursor-e-resize"
            onMouseDown={(event) => handleResizeStart(event, "e")}
          />
        </>
      )}
    </motion.div>
  );
};

export default Window;
