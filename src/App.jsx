import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./styles/theme";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Resources from "./pages/Resources/index";
import Contributors from "./pages/Contributors";
import Quizzes from "./pages/Quizzes";
import Workspace from "./components/Workspace";
import GlobalStyles from "./styles/GlobalStyles";
import FileViewer from "./components/FileViewer";
import { motion, AnimatePresence } from "framer-motion";
import Todo from "./components/Todo";
import LocomotiveScroll from "locomotive-scroll";
import { Analytics } from "@vercel/analytics/react";
import CustomCursor from "./components/CustomCursor";
import LoadingScreen from "./components/LoadingScreen";
import FloatingDrawer from "./components/FloatingDrawer";
import Contributation from "./pages/Contributation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import Statistics from "./components/Statistics";
import MainAttendance from "./components/MainAttendance";
import Attendance from "./pages/Attendance";
import PopupCard from "./components/AuthCard";
import { useAuth0 } from "@auth0/auth0-react";
import MainContribution from "./pages/MainContribution";

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 0;
  margin: 0;

  color: ${(props) => props.theme.text};
  transition: all 0.3s ease;
  position: relative;
  overflow-x: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${(props) => props.theme.background}dd;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 640px) {
    background-size: 900px;
  }
`;

const WorkspaceContainer = styled(motion.div)`
  position: relative;
  z-index: 999;
  margin: 2rem auto;
  max-width: 1200px;
  width: 90%;
`;

const WorkspaceOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const TodoOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TodoContainer = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 2rem;
  border-radius: 12px;

  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 95%;
    padding: 1rem;
    max-height: 80vh;
    margin: 1rem;
  }
`;

const StyledToastContainer = styled(ToastContainer)`
  // Base container styling
  &.Toastify__toast-container {
    padding: 10px;
    width: 320px;
    box-sizing: border-box;
  }

  // Common toast styling
  .Toastify__toast {
    margin-bottom: 12px;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 14px 16px;
    background-color: #f8f9fc; // Light base background
    color: #464d59;
    border-left: 4px solid transparent;

    // Smooth transitions
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
  }

  // Different toast types with subtle colors
  .Toastify__toast--success {
    background-color: #f3fbf8;
    border-left-color: #5ccfab;

    .Toastify__progress-bar {
      background: linear-gradient(to right, #5ccfab, #3db89a);
    }
  }

  .Toastify__toast--error {
    background-color: #fef8f8;
    border-left-color: #f87878;

    .Toastify__progress-bar {
      background: linear-gradient(to right, #f87878, #e05c5c);
    }
  }

  .Toastify__toast--warning {
    background-color: #fffaf2;
    border-left-color: #ffb547;

    .Toastify__progress-bar {
      background: linear-gradient(to right, #ffb547, #f7a62d);
    }
  }

  .Toastify__toast--info {
    background-color: #f2f8fd;
    border-left-color: #62b6ff;

    .Toastify__progress-bar {
      background: linear-gradient(to right, #62b6ff, #4a9af5);
    }
  }

  // Progress bar styling
  .Toastify__progress-bar {
    height: 3px;
    opacity: 0.8;
  }

  // Close button styling
  .Toastify__close-button {
    color: #8896aa;
    opacity: 0.7;

    &:hover {
      opacity: 1;
      color: #464d59;
    }
  }

  // Toast body styling
  .Toastify__toast-body {
    padding: 4px 0;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }
`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

function App() {
  const locomotiveScroll = new LocomotiveScroll();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showTodoMenu, setShowTodoMenu] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthCard, setShowAuthCard] = useState();
  const [disableWorkSpace, setDisableWorkSpace] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const screenSize = window.screen.width;

  let isMobile = false;

  if ("ontouchstart" in window) {
    isMobile = true;
  }

  useEffect(() => {
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  const handleWorkspaceClose = () => {
    setShowWorkspace(false);
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      {/* <CustomCursor /> */}

      <GlobalStyles />
      <LoadingScreen
        isLoading={loading}
        onLoadingComplete={() => setLoading(false)}
        screenSize={screenSize}
      />
      <StyledToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        limit={7}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        className={`fixed inset-0 transition-all duration-700 delay-500 ease-in-out ${
          loading ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        style={{
          backgroundImage:
            screenSize < 700 ? 'url("/BGM.webp")' : 'url("/BG.webp")',
          backgroundBlendMode: "overlay",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          transformStyle: "preserve-3d",
          width: "100%",
          height: "98vh",
        }}
      />

      <div
        className={`relative min-h-screen z-10 transition-all  duration-1000 ease-in-out ${
          loading
            ? "opacity-0 translate-z-[-50px]"
            : "opacity-100 translate-z-0"
        }`}
        onClick={() => {
          if (isMenuOpen) {
            setIsMenuOpen(false);
          }
        }}
      >
        <Router>
          <AppContainer>
            <Analytics />

            <div className="w-screen h-screen flex flex-col overflow-x-hidden">
              <Navigation
                toggleTheme={toggleTheme}
                showTodoMenu={showTodoMenu}
                setShowTodoMenu={setShowTodoMenu}
                showAuthCard={showAuthCard}
                setShowAuthCard={setShowAuthCard}
                setIsMenuOpen={setIsMobileMenuOpen}
                isMenuOpen={isMobileMenuOpen}
                mobileMenuRef={mobileMenuRef}
              />
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home
                        setDisableWorkSpace={setDisableWorkSpace}
                        showAuthCard={showAuthCard}
                        setShowAuthCard={setShowAuthCard}
                      />
                    }
                  />

                  <Route
                    path="/resources"
                    element={
                      <Resources setDisableWorkSpace={setDisableWorkSpace} />
                    }
                  />
                  <Route
                    path="/contributors"
                    element={
                      <Contributors
                        setDisableWorkSpace={setDisableWorkSpace}
                        showAuthCard={showAuthCard}
                        setShowAuthCard={setShowAuthCard}
                      />
                    }
                  />
                  {/* <Route
                    path="/contribute"
                    element={
                      <>
                        {!isLoading && isAuthenticated && (
                          // <Contributation
                          //   setDisableWorkSpace={setDisableWorkSpace}
                          // />
                          <MainContribution
                            setDisableWorkSpace={setDisableWorkSpace}
                          />
                        )}
                      </>
                    }
                  /> */}
                  <Route
                    path="/attendance"
                    element={
                      <>
                        (
                        <Attendance setDisableWorkSpace={setDisableWorkSpace} />
                        )
                      </>
                    }
                  />
                  <Route
                    path="/quizzes"
                    element={
                      <Quizzes setDisableWorkSpace={setDisableWorkSpace} />
                    }
                  />
                </Routes>
              </div>
              <AnimatePresence mode="wait">
                {showAuthCard &&
                  (!isAuthenticated ? (
                    <PopupCard
                      onClose={() => setShowAuthCard(false)}
                      title="Welcome Back"
                      description="Sign in with your RVCE mail id only"
                    >
                      <p>
                        Access your account to enjoy all the features we offer.
                      </p>
                    </PopupCard>
                  ) : (
                    <PopupCard
                      onClose={() => setShowAuthCard(false)}
                      title={`Come Back Soon ${user.name}`}
                      description="You can logout from the portal"
                    >
                      <p>
                        Access to Attendance Management System and Resourse
                        Contribution will be restricted
                      </p>
                    </PopupCard>
                  ))}
                {viewerFile && (
                  <FileViewer
                    key="file-viewer"
                    url={viewerFile.webViewLink}
                    onClose={() => setViewerFile(null)}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* <WorkspaceButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowWorkspace(!showWorkspace)}
              >
                <WorkspacesIcon />
              </WorkspaceButton> */}
              {!disableWorkSpace && (
                <FloatingDrawer
                  setShowWorkspace={setShowWorkspace}
                  isOpen={isMenuOpen}
                  setIsOpen={setIsMenuOpen}
                />
              )}
            </div>
            <AnimatePresence mode="wait">
              {showWorkspace && (
                <>
                  <WorkspaceOverlay
                    key="overlay"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={overlayVariants}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      handleWorkspaceClose();
                    }}
                  >
                    <WorkspaceContainer onClick={(e) => e.stopPropagation()}>
                      <Workspace
                        onClose={() => {
                          handleWorkspaceClose();
                        }}
                        setViewerFile={setViewerFile}
                      />
                    </WorkspaceContainer>
                  </WorkspaceOverlay>
                </>
              )}

              {showTodoMenu && (
                <TodoOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowTodoMenu(false)}
                >
                  <TodoContainer
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Todo onClose={() => setShowTodoMenu(false)} />
                  </TodoContainer>
                </TodoOverlay>
              )}
            </AnimatePresence>
          </AppContainer>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
