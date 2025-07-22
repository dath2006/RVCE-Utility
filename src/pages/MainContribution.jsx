import React, { useState, useEffect } from "react";
import {
  X,
  FilePlus,
  Calendar,
  BarChart2,
  Eye,
  HelpCircle,
  Youtube,
  InfoIcon,
  LogOut,
  MessageCircleQuestionIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import WaveLoader from "../components/Loading";

// Import your components
import Requests from "../components/contribution/Requests";
import ViewContribution from "../components/contribution/ViewContribution";
import ViewRequests from "../components/contribution/ViewRequests";
import FileUploadSystem from "../components/fileUpload/FileUploadSystem";
import { useLocation, useNavigate } from "react-router-dom";

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
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  z-index: 50;
  display: flex;
  height: calc(4rem + env(safe-area-inset-bottom));
  min-height: 56px;
  align-items: center;
  justify-content: space-around;
  // border-radius: 2rem 2rem 0 0;
  box-shadow: 0 -2px 16px 0 rgba(0, 0, 0, 0.12);
  padding-bottom: env(safe-area-inset-bottom);
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

const MainContribution = ({ setDisableWorkSpace }) => {
  const location = useLocation();
  const userRank = location.state?.userRank;
  const [activeComponent, setActiveComponent] = useState("contribute");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDisableWorkSpace(true);
  }, [setDisableWorkSpace]);

  // Improved responsive handler
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 925;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const navigateTo = (componentName) => {
    setActiveComponent(componentName);
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
      case "contribute":
        return (
          <div className=" bg-gradient-to-br bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800">
            <FileUploadSystem setDisableWorkSpace={setDisableWorkSpace} />
          </div>
        );
      case "requests":
        return <Requests />;
      case "view":
        return <ViewContribution isOpen={true} userRank={userRank} />;
      case "your-requests":
        return <ViewRequests />;

      default:
        return (
          <div className=" bg-gradient-to-br bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800">
            <FileUploadSystem setDisableWorkSpace={setDisableWorkSpace} />
          </div>
        );
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
              <h2 className="text-xl font-bold mb-6 ">Contribution System</h2>
              <nav className="space-y-4">
                <button
                  className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                    activeComponent === "contribute"
                      ? "bg-indigo-700 text-white"
                      : " hover:text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => navigateTo("contribute")}
                >
                  <FilePlus size={20} />
                  <span>Contribute</span>
                </button>

                <button
                  className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                    activeComponent === "requests"
                      ? "bg-indigo-700 text-white"
                      : "hover:text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => navigateTo("requests")}
                >
                  <Calendar size={20} />
                  <span>Requests</span>
                </button>

                <button
                  className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                    activeComponent === "view"
                      ? "bg-indigo-700 text-white"
                      : "hover:text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => navigateTo("view")}
                >
                  <BarChart2 size={20} />
                  <span>Your Contributions</span>
                </button>
                <button
                  className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                    activeComponent === "your-requests"
                      ? "bg-indigo-700 text-white"
                      : "hover:text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => navigateTo("your-requests")}
                >
                  <BarChart2 size={20} />
                  <span>Your Requests</span>
                </button>
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

          <div
            className={`flex-1 px-2 overflow-auto ${isMobile ? "pb-16" : ""}`}
          >
            {renderComponent()}
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar - Only on mobile */}
      {isMobile && !loading && (
        <BottomBar
          style={
            {
              // padding: "0.25rem 0.5rem",
              // borderRadius: "2rem",
              // width: "auto",
            }
          }
        >
          <button
            className={`flex flex-col items-center justify-center h-full w-1/5 ${
              activeComponent === "contribute"
                ? "text-indigo-500"
                : "text-gray-400"
            }`}
            onClick={() => navigateTo("contribute")}
          >
            <Calendar size={18} />
            <span className="text-xs mt-1">Contribute</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center h-full w-1/5 ${
              activeComponent === "requests"
                ? "text-indigo-500"
                : "text-gray-400"
            }`}
            onClick={() => navigateTo("requests")}
          >
            <BarChart2 size={18} />
            <span className="text-xs mt-1">Requests</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center h-full w-1/5 ${
              activeComponent === "view" ? "text-indigo-500" : "text-gray-400"
            }`}
            onClick={() => navigateTo("view")}
          >
            <Eye size={18} />
            <span className="text-xs mt-1">View contri.</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center h-full w-1/5 ${
              activeComponent === "your-requests"
                ? "text-indigo-500"
                : "text-gray-400"
            }`}
            onClick={() => navigateTo("your-requests")}
          >
            <Eye size={18} />
            <span className="text-xs mt-1">View req.</span>
          </button>
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-red-400"
            onClick={() => navigate("/")}
          >
            <LogOut size={20} />
            <span className="text-xs mt-1 ">Exit</span>
          </button>
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
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
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
                  <Youtube size={20} color="#ef4444" /> How to use contribution
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
                    src="https://www.youtube.com/embed/Avo5435OVzY?si=nuzVmlErd-qczNcm"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                  This short video demonstrates how to use the contribution
                  system.
                </p>

                <div className="mt-6 p-4 bg-gray-700/20 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-gray-200 flex items-center gap-2 mb-3">
                    <InfoIcon size={16} /> Points to Note
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Before contributing ensure that similar files does not exist.",
                      "While uploading files for requests only one file can be uploaded at once, also only one can be accepted.",
                      "Users will recieve mail regarding the contribution, if their uploaded files are accepted.",
                      "Contribute to requests if they are from the same cluster or sem.",
                      "All the uploaded files will be reviewed by the admin, if accepted then they will be added to the resource page.",
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainContribution;
