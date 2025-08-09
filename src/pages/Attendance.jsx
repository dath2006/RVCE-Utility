import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import { BottomBarProvider, useBottomBar } from "../contexts/BottomBarContext";

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
  /* Keep above dynamic toolbars and gesture areas on mobile */
  bottom: calc(max(1.5rem, env(safe-area-inset-bottom, 0px)));
  width: calc(100vw - 2rem); /* Full width minus left/right margins */
  z-index: 10; /* Lower z-index so modals/popups can appear above */
  display: flex;
  height: 3.5rem; /* Slightly smaller height for modern look */
  min-height: 56px;
  align-items: center;
  justify-content: space-around;
  border-radius: 1.5rem; /* Rounded corners - 24px */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 2px 16px 0 rgba(0, 0, 0, 0.12); /* Enhanced shadow */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  background-clip: padding-box;
  isolation: isolate;
  padding: 0.5rem;

  padding-bottom: calc(0.1rem + env(safe-area-inset-bottom, 0px));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;

  @supports (-webkit-touch-callout: none) {
    position: -webkit-sticky;
    position: sticky;
    bottom: calc(max(1.25rem, env(safe-area-inset-bottom, 0px)));
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

// Internal component that uses the context
const AttendanceContent = ({ setDisableWorkSpace }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [hasTimeTable, setHasTimeTable] = useState(false);
  const [activeComponent, setActiveComponent] = useState("import");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Use the bottom bar context
  const { isBottomBarVisible, hideBottomBar, showBottomBar } = useBottomBar();
  useEffect(() => {
    setDisableWorkSpace(true);
  }, [setDisableWorkSpace]);

  // Handle help modal visibility
  useEffect(() => {
    if (showHelpModal) {
      hideBottomBar("help-modal");
    } else {
      showBottomBar("help-modal");
    }

    return () => {
      showBottomBar("help-modal");
    };
  }, [showHelpModal]); // Remove hideBottomBar and showBottomBar from dependencies

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
              className={`flex-1 p-4 overflow-auto ${isMobile ? "pb-10" : ""}`}
            >
              {renderComponent()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar - Only on mobile and when visible */}
      {isMobile &&
        !loading &&
        isBottomBarVisible &&
        createPortal(
          <BottomBar>
            {!hasTimeTable ? (
              <>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      activeComponent === "import" ||
                      activeComponent === "custom"
                        ? "#6366f1"
                        : "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigateTo("import")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <FilePlus
                      size={18}
                      strokeWidth={1.5}
                      color={
                        activeComponent === "import" ||
                        activeComponent === "custom"
                          ? "#6366f1"
                          : "#a1a1aa"
                      }
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Import
                  </span>
                </button>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <LogOut size={18} strokeWidth={1.5} color="#a1a1aa" />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Exit
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activeComponent === "main" ? "#6366f1" : "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigateTo("main")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <Calendar
                      size={18}
                      strokeWidth={1.5}
                      color={activeComponent === "main" ? "#6366f1" : "#a1a1aa"}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Attendance
                  </span>
                </button>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      activeComponent === "statistics" ? "#6366f1" : "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigateTo("statistics")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <BarChart2
                      size={18}
                      strokeWidth={1.5}
                      color={
                        activeComponent === "statistics" ? "#6366f1" : "#a1a1aa"
                      }
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Stats
                  </span>
                </button>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activeComponent === "view" ? "#6366f1" : "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigateTo("view")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <Eye
                      size={18}
                      strokeWidth={1.5}
                      color={activeComponent === "view" ? "#6366f1" : "#a1a1aa"}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    View
                  </span>
                </button>
                <button
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={resetTimeTable}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <RefreshCw size={18} strokeWidth={1.5} color="#a1a1aa" />
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Reset
                  </span>
                </button>
                <button
                  className="text-red-500"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    padding: "0.35rem 0.25rem",
                    gap: 2,
                    lineHeight: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                >
                  <span
                    className="text-red-500"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 18,
                    }}
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                  </span>
                  <span
                    className="text-red-500"
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    Exit
                  </span>
                </button>
              </>
            )}
          </BottomBar>,
          document.body
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

// Main wrapper component with context provider
const AttendanceSystem = ({ setDisableWorkSpace }) => {
  return (
    <BottomBarProvider>
      <AttendanceContent setDisableWorkSpace={setDisableWorkSpace} />
    </BottomBarProvider>
  );
};

export default AttendanceSystem;
