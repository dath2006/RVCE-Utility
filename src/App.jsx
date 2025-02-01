import React, { useEffect, useState } from "react";
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
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import { motion, AnimatePresence } from "framer-motion";
import Todo from "./components/Todo";
import LocomotiveScroll from "locomotive-scroll";
import { Analytics } from "@vercel/analytics/react";
import CustomCursor from "./components/CustomCursor";

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background: url("/BG.png") no-repeat center center fixed;
  background-size: cover;
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

const WorkspaceButton = styled(motion.button)`
  position: fixed;
  bottom: 7rem;
  left: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${(props) => props.theme.gradient};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
  }
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
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showTodoMenu, setShowTodoMenu] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);

  useEffect(() => {
    localStorage.setItem("theme", "dark");
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
      <CustomCursor />
      <GlobalStyles />
      <Router>
        <AppContainer>
          <Analytics />
          <div className="w-screen h-screen flex flex-col overflow-x-hidden">
            <Navigation
              toggleTheme={toggleTheme}
              showTodoMenu={showTodoMenu}
              setShowTodoMenu={setShowTodoMenu}
            />
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/contributors" element={<Contributors />} />
                <Route path="/quizzes" element={<Quizzes />} />
              </Routes>
            </div>
            <AnimatePresence mode="wait">
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

            <WorkspaceButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowWorkspace(!showWorkspace)}
            >
              <WorkspacesIcon />
            </WorkspaceButton>
          </div>
          <AnimatePresence>
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
    </ThemeProvider>
  );
}

export default App;
