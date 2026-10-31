import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  Download,
  Eye,
  File as FileIcon,
  FileImage,
  FileText,
  Folder,
  Plus,
  Presentation,
  Table2,
} from "lucide-react";

const fileIconFor = (mimeType = "") => {
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return Presentation;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return Table2;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word") || mimeType.startsWith("text/"))
    return FileText;
  return FileIcon;
};
import { Button } from "@/components/ui/button";

const FileCard = ({
  item,
  isSearchResult = false,
  onNavigate,
  onAddToWorkspace,
  onView,
  onDownload,
  activeCardId,
  setActiveCardId,
}) => {
  const isFolder = item.mimeType === "application/vnd.google-apps.folder";

  // Mobile detection
  const isMobile = typeof window !== "undefined" && "ontouchstart" in window;

  const showActions = activeCardId === item.id;

  const getSubjectTag = () => {
    if (!isSearchResult || !item.path || item.path.length === 0) {
      return "";
    }

    const normalize = (name = "") =>
      name
        .toLowerCase()
        .replace(/[()'._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const isContainerFolder = (name = "") =>
      /(cycle|sem|semester|question papers?|resources?)/i.test(name);

    const isTrackFolder = (name = "") => {
      const prefix = name.split(" ")[0];
      return ["ESC", "PLC", "ETC", "Basket"].includes(prefix);
    };

    const isGenericLeafFolder = (name = "") => {
      const normalized = normalize(name);
      return [
        "qp",
        "qps",
        "paper",
        "papers",
        "question paper",
        "question papers",
        "previous year question papers",
        "pyq",
        "resource",
        "resources",
        "extra resources",
        "notes",
        "assignments",
      ].includes(normalized);
    };

    // Walk upward from nearest folder to find the first meaningful subject label.
    for (let i = item.path.length - 1; i >= 0; i -= 1) {
      const candidate = item.path[i];
      if (!candidate) {
        continue;
      }

      if (
        isTrackFolder(candidate) ||
        isContainerFolder(candidate) ||
        isGenericLeafFolder(candidate)
      ) {
        continue;
      }

      return candidate;
    }

    return "";
  };

  const subjectTag = getSubjectTag();

  const handleClick = (e) => {
    if (isFolder) {
      onNavigate();
    } else {
      if (isMobile) {
        setActiveCardId(showActions ? null : item.id);
      } else {
        setActiveCardId(item.id);
      }
    }
  };

  // Close overlay on mobile if user taps outside the overlay
  React.useEffect(() => {
    if (!isMobile || !showActions) return;
    const handleTouch = (e) => {
      if (!e.target.closest(".file-card-action-area")) {
        setActiveCardId(null);
      }
    };
    document.addEventListener("touchstart", handleTouch);
    return () => document.removeEventListener("touchstart", handleTouch);
  }, [isMobile, showActions, setActiveCardId]);

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={handleClick}
      onMouseEnter={
        !isMobile ? () => !isFolder && setActiveCardId(item.id) : undefined
      }
      onMouseLeave={!isMobile ? () => setActiveCardId(null) : undefined}
      className={`file-card-action-area s-tile grain ${isFolder ? "s-tile--folder" : ""}`}
    >
      <div
        className={`flex items-center gap-4 transition-all duration-200 ${
          showActions ? "blur-[1px] opacity-70" : "opacity-100"
        }`}
      >
        <span className="s-tile-icon">
          {isFolder ? (
            <Folder className="h-5 w-5" />
          ) : (
            React.createElement(fileIconFor(item.mimeType), {
              className: "h-5 w-5",
            })
          )}
        </span>
        <p className="line-clamp-2 break-words text-sm font-medium leading-5">
          {item.name}
        </p>
      </div>

      {subjectTag && (
        <span className="s-tile-tag">{subjectTag}</span>
      )}

      <AnimatePresence>
        {!isFolder && showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isMobile ? (e) => e.stopPropagation() : undefined}
            className="absolute inset-0 flex items-center justify-center gap-3 bg-background/80 px-4 backdrop-blur-sm"
          >
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
              <Button
                type="button"
                size="icon"
                className="s-iconbtn s-iconbtn--solid h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWorkspace(item);
                  if (isMobile) setActiveCardId(null);
                }}
                aria-label="Add file to workspace"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
              <Button
                type="button"
                size="icon"
                className="s-iconbtn s-iconbtn--solid h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(item);
                  if (isMobile) setActiveCardId(null);
                }}
                aria-label="View file"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
              <Button
                type="button"
                size="icon"
                className="s-iconbtn s-iconbtn--solid h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item);
                  if (isMobile) setActiveCardId(null);
                }}
                aria-label="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileCard;
