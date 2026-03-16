import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { lightTheme, darkTheme } from "./styles/theme";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Resources from "./pages/Resources/index";
import Contributors from "./pages/Contributors";
import Workspace from "./components/Workspace";
import GlobalStyles from "./styles/GlobalStyles";
import FileViewer from "./components/FileViewer";
import { motion, AnimatePresence } from "framer-motion";
import Todo from "./components/Todo";
import { ReactLenis } from "lenis/react";
import { Analytics } from "@vercel/analytics/react";
import FloatingDrawer from "./components/FloatingDrawer";
import MainContribution from "./pages/MainContribution";
import { Toaster } from "@/components/ui/sonner";
import Attendance from "./pages/Attendance";
import PopupCard from "./components/AuthCard";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet } from "react-helmet";
import Essentials from "./pages/Essentials";
import BottomBar from "./components/BottomBar";
import { NavigationProvider, useOverlay } from "./contexts/NavigationContext";
import RedesignFeedbackPrompt from "./components/RedesignFeedbackPrompt";

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 0;
  margin: 0;

  color: ${(props) => props.theme.text};
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
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

const ThemeTransitionStyles = createGlobalStyle`
  @media (prefers-reduced-motion: no-preference) {
    ::view-transition-group(root),
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.7s;
    }

    ::view-transition-group(root) {
      animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    ::view-transition-old(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    ::view-transition-new(root) {
      mix-blend-mode: normal;
      will-change: clip-path, filter;
      animation: themeButtonReveal 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    @keyframes themeButtonReveal {
      0% {
        clip-path: circle(
          var(--theme-transition-start-radius, 0px) at
            var(--theme-transition-x, 50vw) var(--theme-transition-y, 50vh)
        );
        filter: blur(12px) brightness(1.03);
      }
      55% {
        filter: blur(5px) brightness(1.015);
      }
      100% {
        clip-path: circle(
          var(--theme-transition-end-radius, 150vmax) at
            var(--theme-transition-x, 50vw) var(--theme-transition-y, 50vh)
        );
        filter: blur(0) brightness(1);
      }
    }
  }
`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const setThemeTransitionOrigin = (triggerElement) => {
  if (typeof window === "undefined") {
    return;
  }

  const rect = triggerElement?.getBoundingClientRect?.();
  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const startRadius = rect ? Math.max(rect.width, rect.height) * 0.55 : 0;
  const endRadius = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  );

  document.documentElement.style.setProperty(
    "--theme-transition-x",
    `${centerX}px`,
  );
  document.documentElement.style.setProperty(
    "--theme-transition-y",
    `${centerY}px`,
  );
  document.documentElement.style.setProperty(
    "--theme-transition-start-radius",
    `${startRadius}px`,
  );
  document.documentElement.style.setProperty(
    "--theme-transition-end-radius",
    `${endRadius}px`,
  );
};

function AppContent() {
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showTodoMenu, setShowTodoMenu] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [loading] = useState(false);
  const [showAuthCard, setShowAuthCard] = useState(false);
  const [disableWorkSpace, setDisableWorkSpace] = useState(false);
  const screenSize = window.screen.width;

  // Register overlays with navigation context
  useOverlay("workspace", showWorkspace);
  useOverlay("todoMenu", showTodoMenu);
  useOverlay("authCard", showAuthCard);
  useOverlay("fileViewer", !!viewerFile);

  useEffect(() => {
    // Syncs DOM dark class on initial mount / hydration.
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const toggleTheme = (triggerElement) => {
    setThemeTransitionOrigin(triggerElement);

    const applyThemeToggle = () => {
      const newTheme = theme === "light" ? "dark" : "light";
      // Synchronously flip the Tailwind dark-class AND React state in the same
      // tick � View Transition must never capture a frame where one system has
      // flipped but the other has not (that gap is the visible blink).
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || reduceMotion) {
      applyThemeToggle();
      return;
    }

    document.startViewTransition(() => {
      applyThemeToggle();
    });
  };

  const handleWorkspaceClose = () => {
    setShowWorkspace(false);
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      {/* <CustomCursor /> */}
      <Helmet>
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <GlobalStyles />
      <ThemeTransitionStyles />
      {/* <LoadingScreen
        isLoading={loading}
        onLoadingComplete={() => setLoading(false)}
        screenSize={screenSize}
      /> */}
      <Toaster position="top-right" richColors closeButton duration={3000} />
      <div
        className={`fixed inset-0 transition-all duration-700 delay-500 ease-in-out ${
          loading ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle at top, rgba(120, 119, 198, 0.14), transparent 40%), linear-gradient(180deg, #020617 0%, #0f172a 38%, #111827 100%)"
              : "radial-gradient(circle at top, rgba(15, 23, 42, 0.06), transparent 35%), linear-gradient(180deg, #ffffff 0%, #f8fafc 42%, #eef2ff 100%)",
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100vh",
        }}
      />

      <div
        className={`relative min-h-screen z-10 transition-all  duration-1000 ease-in-out ${
          loading
            ? "opacity-0 translate-z-[-50px]"
            : "opacity-100 translate-z-0"
        }`}
      >
        <Router>
          <AppContainer>
            <Analytics />
            <RedesignFeedbackPrompt
              user={user}
              isAuthenticated={isAuthenticated}
            />

            <div className="w-screen h-screen flex flex-col overflow-x-hidden">
              <Navigation
                theme={theme}
                toggleTheme={toggleTheme}
                showTodoMenu={showTodoMenu}
                setShowTodoMenu={setShowTodoMenu}
                showAuthCard={showAuthCard}
                setShowAuthCard={setShowAuthCard}
              />
              <ReactLenis
                className="flex-1 overflow-y-auto overflow-x-hidden"
                id="main-scroll-container"
                data-scroll-container
                options={{
                  duration: 1,
                  smoothWheel: true,
                  smoothTouch: false,
                  wheelMultiplier: 0.95,
                }}
              >
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
                      <Resources
                        screenSize={screenSize}
                        setDisableWorkSpace={setDisableWorkSpace}
                      />
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
                  <Route
                    path="/contribute"
                    element={
                      <>
                        {!isLoading && isAuthenticated && (
                          <MainContribution
                            setDisableWorkSpace={setDisableWorkSpace}
                          />
                        )}
                      </>
                    }
                  />
                  <Route
                    path="/attendance"
                    element={
                      <Attendance setDisableWorkSpace={setDisableWorkSpace} />
                    }
                  />
                  <Route path="/essentials" element={<Essentials />} />
                </Routes>
              </ReactLenis>
              <BottomBar
                setShowAuthCard={setShowAuthCard}
                showAuthCard={showAuthCard}
              />
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
                      title={`Come Back Soon ${user?.name || ""}`.trim()}
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
                    title={viewerFile.name}
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
                whilehover={{ scale: 1.1 }}
                whiletap={{ scale: 0.9 }}
                onClick={() => setShowWorkspace(!showWorkspace)}
              >
                <WorkspacesIcon />
              </WorkspaceButton> */}

              {!disableWorkSpace && (
                <FloatingDrawer setShowWorkspace={setShowWorkspace} />
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

// Main App component with NavigationProvider
function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
