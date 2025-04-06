import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Menu, Close, DarkMode, LightMode } from "@mui/icons-material";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { motion, AnimatePresence } from "framer-motion";

import "./Navigation.css";
import UtilityDropdown from "./UtilityDropdown";

const Nav = styled.nav`
  padding: 1rem 2rem;
  background: rgba(255, 248, 248, 0.07);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(7.8px);
  border: 1px solid rgba(255, 248, 248, 0.12);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 99;
  @media (max-width: 500px) {
    padding: 0.5rem 1rem;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;

  @media (max-width: 500px) {
    height: 2.7rem;
  }
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  gap: 2rem;
  display: flex;

  @media (max-width: 924px) {
    display: ${(props) => (props.isOpen ? "flex" : "none")};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: ${(props) => props.theme.surface};
    padding: 1rem;
    justify-content: center;
    z-index: 999;
    // background: rgba(255, 248, 248, 0.07);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    -webkit-backdrop-filter: blur(7.8px);
    border: 1px solid rgba(255, 248, 248, 0.12);
  }
`;

const NavLink = styled(Link)`
  color: ${(props) => props.theme.text};

  text-decoration: none;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text};

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
  @media (max-width: 924px) {
    display: block;
    z-index: 1000;
  }
`;

const BetaTag = styled(motion.span)`
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: black;
  color: white;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: 600;
  vertical-align: middle;
  cursor: default;

  @media (max-width: 500px) {
    font-size: 0.5rem;
    margin-right: 0.3rem;
  }
`;

const Title = styled.h1`
  color: ${(props) => props.theme.text};
  @media (max-width: 500px) {
    font-size: 1.2rem;
  }
`;

const Navigation = ({
  toggleTheme,
  showTodoMenu,
  setShowTodoMenu,
  showAuthCard,
  setShowAuthCard,
}) => {
  const { isSignedIn, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);

  const dropdownRef = useRef(null);

  // const letters = "Utility".split("");
  // const reversedLetters = "Utility".split("").reverse();

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
        <div className="flex items-center gap-2">
          <div className="content">
            <Logo to="/">
              <Title className="title">ಆರ್.ವಿ</Title>

              {/* <div class="aurora">
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
              </div> */}
            </Logo>
          </div>
          <div
            className="relative"
            onMouseEnter={() => setShowUtilityMenu(true)}
            onMouseLeave={() => setShowUtilityMenu(false)}
            ref={dropdownRef}
          >
            <button
              class="button"
              data-text="Awesome"
              initial={false}
              onClick={() => setShowUtilityMenu(!showUtilityMenu)}
            >
              <span class="actual-text">&nbsp;utility&nbsp;</span>
              <span aria-hidden="true" class="hover-text">
                &nbsp;utility&nbsp;
              </span>
            </button>
            {/* <motion.div className="absolute inset-0 " />
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
              </div>  */}

            <AnimatePresence>
              {showUtilityMenu && (
                <UtilityDropdown
                  showTodoMenu={showTodoMenu}
                  setShowTodoMenu={setShowTodoMenu}
                  isDarkMode={isDarkMode}
                />
              )}
            </AnimatePresence>
          </div>
          <BetaTag
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ALPHA
          </BetaTag>
        </div>

        <NavLinks isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/contributors">Contribute</NavLink>
          <NavLink to="/quizzes">Quizzes</NavLink>
          <NavLink
            to={isSignedIn && isLoaded && "/attendance"}
            onClick={() => {
              if (!isSignedIn) {
                setShowAuthCard(!showAuthCard);
              }
            }}
          >
            Attendance
          </NavLink>
        </NavLinks>
        <div className="flex gap-1 sm:gap-4">
          <div className="flex items-center gap-3">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <button onClick={() => setShowAuthCard(!showAuthCard)}>
                <AccountCircleIcon />
              </button>
            </SignedOut>
          </div>
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
