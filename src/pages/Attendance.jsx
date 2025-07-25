import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  FilePlus,
  Calendar,
  BarChart2,
  Eye,
  RefreshCw,
  HelpCircle,
  Youtube,
  InfoIcon,
  LogOut,
  MessageCircleQuestionIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import WaveLoader from "../components/Loading";
import { useNavigate } from "react-router-dom";

// Import your components
import ImportTimeTable from "../components/ImportTimeTable";
import CustomTimeTable from "../components/CustomTimeTable";
import MainAttendance from "../components/MainAttendance";
import Statistics from "../components/Statistics";
import ViewTimeTable from "../components/ViewTimeTable";

const SideBar = styled(motion.div)`
  backdrop-filter: blur(21px) saturate(180%);
  -webkit-backdrop-filter: blur(21px) saturate(180%);
  background-color: ${(props) => props.theme.glassbgc};
  width: 16rem; /* w-64 = 64 * 0.25rem = 16rem = 256px */
  flex-shrink: 0;
  z-index: 10;
  overflow-y: auto;
`;
const BottomBar = styled(motion.div)`
  backdrop-filter: blur(21px) saturate(180%);
  -webkit-backdrop-filter: blur(21px) saturate(180%);
  background-color: ${(props) => props.theme.glassbgc};
  position: fixed;
  left: 1rem; /* 16px margin from left */
  right: 1rem; /* 16px margin from right */
  bottom: 1.5rem; /* 24px from bottom - elevated look */
  width: calc(100vw - 2rem); /* Full width minus left/right margins */
  z-index: 50;
  display: flex;
  height: 3.5rem; /* Slightly smaller height for modern look */
  min-height: 56px;
  align-items: center;
  justify-content: space-around;
  border-radius: 1.5rem; /* Rounded corners - 24px */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 2px 16px 0 rgba(0, 0, 0, 0.12); /* Enhanced shadow */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border for glass effect */
  padding: 0.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease; /* Smooth transition */
  transform: ${(props) => {
    return props.isHidden
      ? "translate3d(0, calc(100% + 2rem), 0)"
      : "translate3d(0, 0, 0)";
  }};
  opacity: ${(props) => (props.isHidden ? 0 : 1)};

  @supports (-webkit-touch-callout: none) {
    position: -webkit-sticky;
    position: sticky;
    bottom: 1.5rem;
  }

  @media (min-width: 925px) {
    display: none;
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const useBottomBarAutoHide = () => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e) => {
      let currentScroll = 0;

      // Get scroll position from the event target
      if (e && e.target) {
        currentScroll = e.target.scrollTop || 0;
      }

      // At top - always show
      if (currentScroll <= 10) {
        setIsHidden(false);
        lastScrollRef.current = currentScroll;
        return;
      }

      // Check scroll direction with threshold
      const scrollDiff = currentScroll - lastScrollRef.current;

      if (Math.abs(scrollDiff) > 10) {
        // 10px threshold
        if (scrollDiff > 0) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
        lastScrollRef.current = currentScroll;
      }
    };

    // Function to find and attach to scroll containers
    const attachScrollListeners = () => {
      // Wait for DOM to be ready and find containers
      const containers = [
        // Try to find the main app scroll container
        document.querySelector("div.flex-1.overflow-y-auto"),
        document.querySelector(".overflow-y-auto"),
        // Fallback to any scrollable container
        ...document.querySelectorAll('[class*="overflow-y-auto"]'),
        ...document.querySelectorAll('[class*="overflow-auto"]'),
        // Last resort - document and window
        document.documentElement,
        document.body,
      ].filter(Boolean);

      const addedListeners = [];

      containers.forEach((container, index) => {
        const wrappedHandler = (e) => {
          // Ensure we're handling the right container
          if (e.target === container || container.contains(e.target)) {
            handleScroll(e);
          }
        };

        container.addEventListener("scroll", wrappedHandler, {
          passive: true,
          capture: false,
        });

        addedListeners.push({ container, handler: wrappedHandler });
      });

      return addedListeners;
    };

    // Delay to ensure DOM is ready
    timeoutRef.current = setTimeout(() => {
      const listeners = attachScrollListeners();

      // Store for cleanup
      window._bottomBarScrollListeners = listeners;
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Cleanup listeners
      if (window._bottomBarScrollListeners) {
        window._bottomBarScrollListeners.forEach(({ container, handler }) => {
          container.removeEventListener("scroll", handler);
        });
        delete window._bottomBarScrollListeners;
      }
    };
  }, []);

  return isHidden;
};
const AttendanceSystem = ({ setDisableWorkSpace }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [hasTimeTable, setHasTimeTable] = useState(false);
  const [activeComponent, setActiveComponent] = useState("import");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const isBottomBarHidden = useBottomBarAutoHide();
  useEffect(() => {
    setDisableWorkSpace(true);
  }, [setDisableWorkSpace]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      handleHasTimeTable();
    }
  }, [isLoading, isAuthenticated]);

  // Improved responsive handler
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 925;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleHasTimeTable = async () => {
    if (!isLoading && isAuthenticated) {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable/check?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          const hasTable = res.data.hasTimeTable;
          setActiveComponent(hasTable ? "main" : "import");
          setShowHelpModal(!hasTable);
          setHasTimeTable(hasTable);
        }
      } catch (error) {
        console.error("Error checking time table:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateTo = (componentName) => {
    setActiveComponent(componentName);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCreateTimeTable = () => {
    setActiveComponent("custom");
  };

  const resetTimeTable = () => {
    setActiveComponent("import");
  };

  // Render the active component
  const renderComponent = () => {
    if (loading) {
      return (
        <LoadingSpinner>
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </LoadingSpinner>
      );
    }

    switch (activeComponent) {
      case "import":
        return (
          <ImportTimeTable
            setActiveComponent={setActiveComponent}
            setHasTimeTable={setHasTimeTable}
            onCreateClick={handleCreateTimeTable}
          />
        );
      case "custom":
        return (
          <CustomTimeTable
            setActiveComponent={setActiveComponent}
            setHasTimeTable={setHasTimeTable}
            setShowHelpModal={setShowHelpModal}
          />
        );
      case "main":
        return <MainAttendance setActiveComponent={setActiveComponent} />;
      case "statistics":
        return <Statistics />;
      case "view":
        return <ViewTimeTable />;
      default:
        return <ImportTimeTable onCreateClick={handleCreateTimeTable} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full pt-[73px]">
      {/* Main Layout Container */}
      <div className="flex h-full overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        {!isMobile && !loading && (
          <SideBar>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-6 ">Attendance System</h2>
              <nav className="space-y-4">
                {!hasTimeTable && (
                  <button
                    className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                      activeComponent === "import" ||
                      activeComponent === "custom"
                        ? "bg-indigo-700 "
                        : " hover:text-white hover:bg-indigo-700"
                    }`}
                    onClick={() => navigateTo("import")}
                  >
                    <FilePlus size={20} />
                    <span>Import TimeTable</span>
                  </button>
                )}

                {hasTimeTable && (
                  <>
                    <button
                      className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                        activeComponent === "main"
                          ? "bg-indigo-700 text-white"
                          : "hover:text-white hover:bg-indigo-700"
                      }`}
                      onClick={() => navigateTo("main")}
                    >
                      <Calendar size={20} />
                      <span>Attendance</span>
                    </button>

                    <button
                      className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                        activeComponent === "statistics"
                          ? "bg-indigo-700 text-white"
                          : "hover:text-white hover:bg-indigo-700"
                      }`}
                      onClick={() => navigateTo("statistics")}
                    >
                      <BarChart2 size={20} />
                      <span>Statistics</span>
                    </button>

                    <button
                      className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                        activeComponent === "view"
                          ? "bg-indigo-700 text-white"
                          : " hover:text-white hover:bg-indigo-700"
                      }`}
                      onClick={() => navigateTo("view")}
                    >
                      <Eye size={20} />
                      <span>View TimeTable</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 w-full p-2 rounded-lg text-red-400 hover:bg-indigo-700 hover:text-red-300"
                      onClick={resetTimeTable}
                    >
                      <RefreshCw size={20} />
                      <span>Reset TimeTable</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </SideBar>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Help Button - Only on desktop */}
          {!isMobile && (
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors z-10"
              onClick={() => setShowHelpModal(true)}
            >
              <HelpCircle size={20} />
            </button>
          )}

          {/* Special view mode handling */}
          {activeComponent === "view" ? (
            <div className="w-full h-full" style={{ position: "relative" }}>
              <div className="absolute inset-0 overflow-x-auto">
                <ViewTimeTable />
              </div>
            </div>
          ) : activeComponent === "custom" ? (
            <div className="w-full h-full" style={{ position: "relative" }}>
              <div className="absolute inset-0 overflow-x-auto">
                <CustomTimeTable
                  setActiveComponent={setActiveComponent}
                  setHasTimeTable={setHasTimeTable}
                  setShowHelpModal={setShowHelpModal}
                />
              </div>
            </div>
          ) : (
            <div
              className={`flex-1 p-4 overflow-auto ${isMobile ? "pb-16" : ""}`}
            >
              {renderComponent()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar - Only on mobile */}
      {isMobile && !loading && (
        <BottomBar>
          {!hasTimeTable ? (
            <>
              <button
                className={`flex flex-col items-center justify-center h-full w-1/2 ${
                  activeComponent === "import" || activeComponent === "custom"
                    ? "text-indigo-500"
                    : "text-gray-400"
                }`}
                onClick={() => navigateTo("import")}
              >
                <FilePlus size={20} />
                <span className="text-xs mt-1">Import</span>
              </button>
              <button
                className="flex flex-col items-center justify-center h-full w-1/2 text-gray-400"
                onClick={() => navigate("/")}
              >
                <LogOut size={20} />
                <span className="text-xs mt-1">Exit</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`flex flex-col items-center justify-center h-full w-1/5 ${
                  activeComponent === "main"
                    ? "text-indigo-500"
                    : "text-gray-400"
                }`}
                onClick={() => navigateTo("main")}
              >
                <Calendar size={18} />
                <span className="text-xs mt-1">Attendance</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center h-full w-1/5 ${
                  activeComponent === "statistics"
                    ? "text-indigo-500"
                    : "text-gray-400"
                }`}
                onClick={() => navigateTo("statistics")}
              >
                <BarChart2 size={18} />
                <span className="text-xs mt-1">Stats</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center h-full w-1/5 ${
                  activeComponent === "view"
                    ? "text-indigo-500"
                    : "text-gray-400"
                }`}
                onClick={() => navigateTo("view")}
              >
                <Eye size={18} />
                <span className="text-xs mt-1">View</span>
              </button>
              <button
                className="flex flex-col items-center justify-center h-full w-1/5 text-red-400"
                onClick={resetTimeTable}
              >
                <RefreshCw size={18} />
                <span className="text-xs mt-1">Reset</span>
              </button>
              <button
                className="flex flex-col items-center justify-center h-full w-1/5 text-red-400"
                onClick={() => navigate("/")}
              >
                <LogOut size={20} />
                <span className="text-xs mt-1">Exit</span>
              </button>
            </>
          )}
        </BottomBar>
      )}

      {/* Floating Help Flag for mobile, only when bottom bar is visible */}
      {isMobile && !loading && (
        <button
          onClick={() => setShowHelpModal(true)}
          style={{
            position: "fixed",
            top: 80,
            right: -15,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#e0e7ff", // Tailwind bg-indigo-100
            color: "#4f46e5", // Tailwind text-indigo-600
            border: "none",
            borderRadius: "100px 0 0 100px",
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
            padding: "0.4rem 0.7rem 0.4rem 0.7rem",
            fontWeight: 500,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          <MessageCircleQuestionIcon size={20} style={{ marginRight: 7 }} />
        </button>
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHelpModal(false);
              }
            }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Youtube size={20} color="#ef4444" /> How to use attendance
                  system
                </h3>
                <button
                  className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-100"
                  onClick={() => setShowHelpModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/v71013_yw20?si=xB1EOVe00qWXolX-"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                  This short video demonstrates how to use the attendance
                  system.
                </p>

                <div className="mt-6 p-4 bg-gray-700/20 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-gray-200 flex items-center gap-2 mb-3">
                    <InfoIcon size={16} /> Points to Note
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "This Attendance System is for your reference only, so that you can track it.",
                      "Initially attendance of all classes are set to pending.",
                      "Clear the pending attendance from the academic start date, so to get the clear statistics.",
                      'Mark attendance as "ignore" if a class is cancelled, or its a holiday.',
                      "Be careful while creating custom attendance, as it cannot be edited later.",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="text-gray-400 text-sm pl-5 relative"
                      >
                        <span className="absolute left-0 text-blue-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceSystem;
