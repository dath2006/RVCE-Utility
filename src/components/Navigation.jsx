import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Menu, Close, DarkMode, LightMode } from "@mui/icons-material";
import { GitHub, Chat, CheckCircle } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Chatgpt from "../assets/chatgpt-icon.svg";
import "./Navigation.css";

const Nav = styled.nav`
  padding: 1rem 2rem;
  background: ${(props) => props.theme.gradient};
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 99;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;

  @media (max-width: 500px) {
    height: 2rem;
  }
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${(props) => (props.isOpen ? "flex" : "none")};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: ${(props) => props.theme.gradient};
    padding: 1rem;
    gap: 1rem;
    z-index: 999;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }
`;

const MobileMenuButton = styled(IconButton)`
  display: none;
  @media (max-width: 768px) {
    display: block;
    z-index: 1000;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 12rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px ${(props) => props.theme.shadow};
  overflow: hidden;
  z-index: 1000;
`;

const BetaTag = styled(motion.span)`
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: 600;
  vertical-align: middle;
  cursor: default;
`;

const Navigation = ({ toggleTheme, showTodoMenu, setShowTodoMenu }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);

  const dropdownRef = useRef(null);

  const letters = "Utility".split("");
  const reversedLetters = "Utility".split("").reverse();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUtilityMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toggleTheme();
  };

  return (
    <Nav>
      <NavContainer>
        <div className="flex items-center gap-3">
          <div className="content">
            <Logo to="/">
              <div className="title">ಆರ್.ವಿ</div>

              <div class="aurora">
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
              </div>
            </Logo>
          </div>
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setShowUtilityMenu(!showUtilityMenu)}
              className="px-4 py-2 rounded-md relative overflow-hidden"
              initial={false}
            >
              <motion.div
                className="absolute inset-0 border-2 rounded-md"
                animate={{
                  borderColor: ["#f97316", "#ef4444", "#f97316"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <div className="relative h-6">
                <div className="flex space-x-[0.2em]">
                  {letters.map((letter, index) => (
                    <motion.span
                      key={index}
                      animate={{
                        y: showUtilityMenu ? 20 : 0,
                        rotateX: showUtilityMenu ? 90 : 0,
                        opacity: showUtilityMenu ? 0 : 1,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="inline-block"
                      style={{ transformOrigin: "50% 50%" }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
                <div className="flex space-x-[0.2em] absolute top-0 left-0 w-full">
                  {reversedLetters.map((letter, index) => (
                    <motion.span
                      key={`reverse-${index}`}
                      initial={{ y: -20, rotateX: -90, opacity: 0 }}
                      animate={{
                        y: showUtilityMenu ? 0 : -20,
                        rotateX: showUtilityMenu ? 0 : -90,
                        opacity: showUtilityMenu ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: (letters.length - 1 - index) * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="inline-block"
                      style={{ transformOrigin: "50% 50%" }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {showUtilityMenu && (
                <DropdownMenu
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                  }}
                  style={{ originY: 0 }}
                >
                  <motion.div
                    initial={{ rotateX: -90 }}
                    animate={{ rotateX: 0 }}
                    exit={{ rotateX: -90 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    }}
                  >
                    <a
                      href="https://chat.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        "flex items-center gap-2 px-2 py-2 " +
                        (isDarkMode
                          ? " hover:bg-gray-700"
                          : "hover:bg-gray-200")
                      }
                    >
                      <img
                        rel="icon"
                        type="image/svg+xml"
                        href="../assets/chatgpt-icon.svg"
                      />
                      <img src={Chatgpt} className="h-6 " />
                      <span>ChatGPT</span>
                    </a>
                    <a
                      href="https://github.com/aditya-bhandari-cd23/FIRST-YEARS-ARCHIVE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        "flex items-center gap-2 px-4 py-2" +
                        (isDarkMode
                          ? " hover:bg-gray-700"
                          : "hover:bg-gray-200")
                      }
                    >
                      <GitHub size={18} />
                      <span>GitHub</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowTodoMenu(!showTodoMenu);
                      }}
                      className={
                        "w-full flex items-center gap-2 px-4 py-2 " +
                        (isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200")
                      }
                    >
                      <CheckCircle size={18} />
                      <span>Taskflow</span>
                    </button>
                  </motion.div>
                </DropdownMenu>
              )}
            </AnimatePresence>
          </div>
          <BetaTag
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            BETA
          </BetaTag>
        </div>

        <NavLinks isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/contributors">Contributors</NavLink>
          <NavLink to="/quizzes">Quizzes</NavLink>
        </NavLinks>
        <div style={{ display: "flex", gap: "1rem" }}>
          <IconButton onClick={handleThemeToggle}>
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Close /> : <Menu />}
          </MobileMenuButton>
        </div>
      </NavContainer>
    </Nav>
  );
};

export default Navigation;
