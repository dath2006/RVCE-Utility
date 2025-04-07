import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import styled from "styled-components";

import { motion, AnimatePresence } from "framer-motion";

const SideBar = styled(motion.div)`
  position: fixed;
  backdrop-filter: blur(21px) saturate(180%);
  -webkit-backdrop-filter: blur(21px) saturate(180%);
  background-color: ${(props) => props.theme.glassbgc};
`;

const HelpButton = styled(motion.button)`
  position: absolute;
  top: 5rem;
  right: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;

  @media (max-width: 768px) {
    top: 4.8rem;
    right: 1rem;
    width: 36px;
    height: 36px;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: #1f2937;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  color: #e5e7eb;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const VideoContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #111827;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const VideoText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Import your components
import ImportTimeTable from "../components/ImportTimeTable";
import CustomTimeTable from "../components/CustomTimeTable";
import MainAttendance from "../components/MainAttendance";
import Statistics from "../components/Statistics";
import ViewTimeTable from "../components/ViewTimeTable";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

const AttendanceSystem = ({ setDisableWorkSpace }) => {
  // States for managing components and navigation
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [hasTimeTable, setHasTimeTable] = useState(false);
  const [activeComponent, setActiveComponent] = useState("import");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(true);
    };
    setShow();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      handleHasTimeTable();
    }
  }, [isLoading, isAuthenticated]);

  // Handle responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleHasTimeTable = async () => {
    try {
      if (!isLoading && isAuthenticated) {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable/check?email=${user.email}`
        );
        if (res.data.success) {
          setActiveComponent(res.data.hasTimeTable ? "main" : "import");
          setShowHelpModal(res.data.hasTimeTable ? false : true);
          setHasTimeTable(res.data.hasTimeTable);
        } else {
          toast.error("Error checking time table !");
        }
      }
    } catch (error) {
      console.error("Error checking time table:", error);
      toast.error("Error checking time table !");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to component
  const navigateTo = (componentName) => {
    setActiveComponent(componentName);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle import time table component's create button
  const handleCreateTimeTable = () => {
    setActiveComponent("custom");
  };

  // Reset time table
  const resetTimeTable = () => {
    setActiveComponent("import");
  };

  // Render the active component
  const renderComponent = () => {
    switch (activeComponent) {
      case "import":
        return (
          activeComponent === "import" && (
            <ImportTimeTable
              setActiveComponent={setActiveComponent}
              setHasTimeTable={setHasTimeTable}
              onCreateClick={handleCreateTimeTable}
            />
          )
        );
      case "custom":
        return (
          activeComponent === "custom" && (
            <CustomTimeTable
              setActiveComponent={setActiveComponent}
              setHasTimeTable={setHasTimeTable}
              setShowHelpModal={setShowHelpModal}
            />
          )
        );
      case "main":
        return activeComponent === "main" && <MainAttendance />;
      case "statistics":
        return activeComponent === "statistics" && <Statistics />;
      case "view":
        return activeComponent === "view" && <ViewTimeTable />;
      default:
        return <ImportTimeTable onCreateClick={handleCreateTimeTable} />;
    }
  };

  return (
    <div className={`flex h-screen w-full ${!isMobile && " pt-20"}`}>
      {" "}
      {/* 75px (pt-20) space for top navbar */}
      {/* Sidebar Toggle Button for Mobile */}
      <HelpButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelpModal(true)}
      >
        <HelpCircle size={20} />
      </HelpButton>
      <button
        className={`fixed z-20  top-20 left-4 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden ${
          sidebarOpen ? "hidden" : "block"
        }`}
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>
      {/* Sidebar / Navigation */}
      <SideBar
        className={`fixed z-10  bottom-0 left-0 w-64 shadow-lg transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0  ${isMobile ? " top-[3.7rem]" : "top-[4.6rem]"} `}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <div className="flex justify-end p-2">
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Attendance System</h2>

          <nav className="space-y-4">
            {!hasTimeTable && (
              <button
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeComponent === "import" || activeComponent === "custom"
                    ? "bg-indigo-700 text-white"
                    : " "
                }`}
                onClick={() => {
                  navigateTo("import");
                  isMobile && setSidebarOpen(false);
                }}
              >
                <FilePlus size={20} />
                <span>Import TimeTable</span>
              </button>
            )}

            {hasTimeTable && (
              <button
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeComponent === "main"
                    ? "bg-indigo-700 text-white"
                    : " hover:text-white hover:bg-indigo-700"
                }`}
                onClick={() => {
                  navigateTo("main");
                  isMobile && setSidebarOpen(false);
                }}
              >
                <Calendar size={20} />
                <span>Attendance</span>
              </button>
            )}

            {hasTimeTable && (
              <button
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeComponent === "statistics"
                    ? "bg-indigo-700 text-white"
                    : "  hover:text-white hover:bg-indigo-700"
                }`}
                onClick={() => {
                  navigateTo("statistics");
                  isMobile && setSidebarOpen(false);
                }}
              >
                <BarChart2 size={20} />
                <span>Statistics</span>
              </button>
            )}

            {hasTimeTable && (
              <button
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeComponent === "view"
                    ? "bg-indigo-700 text-white"
                    : " hover:text-white hover:bg-indigo-700"
                }`}
                onClick={() => {
                  navigateTo("view");
                  isMobile && setSidebarOpen(false);
                }}
              >
                <Eye size={20} />
                <span>View TimeTable</span>
              </button>
            )}

            {hasTimeTable && (
              <button
                className="flex items-center space-x-2 w-full p-2 rounded-lg text-red-400  hover:bg-indigo-700"
                onClick={resetTimeTable}
              >
                <RefreshCw size={20} />
                <span>Reset TimeTable</span>
              </button>
            )}
          </nav>
        </div>
      </SideBar>
      {/* Main Content Area */}
      <div
        className={`flex-1  h-full p-6 overflow-auto transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        {loading ? (
          <LoadingSpinner>
            <div className="spinner" />
          </LoadingSpinner>
        ) : (
          <div className="h-full ">{renderComponent()}</div>
        )}
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className={" inset-0 bg-opacity-50 z-0"}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AnimatePresence>
        {showHelpModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHelpModal(false);
              }
            }}
          >
            <Modal
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <ModalHeader>
                <ModalTitle>
                  <Youtube size={20} color="#ef4444" /> How to use attendance
                  system
                </ModalTitle>
                <CloseButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHelpModal(false)}
                >
                  <X size={18} />
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <VideoContainer>
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/VZXFQxf087w?si=oPYg6twAnI11fbrK"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  ></iframe>
                </VideoContainer>
                <VideoText>
                  This short video demonstrates how to use the attendance
                  system.
                  <br />
                </VideoText>
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceSystem;
