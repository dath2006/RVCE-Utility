import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Menu, Close, DarkMode, LightMode } from "@mui/icons-material";
import { useAuth0 } from "@auth0/auth0-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { motion, AnimatePresence } from "framer-motion";

import "./Navigation.css";
import UtilityDropdown from "./UtilityDropdown";
import { Home, BookOpen, Users, CalendarCheck } from "lucide-react";
import { FaToolbox } from "react-icons/fa";

// Updated Nav component with auto-hide functionality for mobile
const Nav = styled(motion.nav)`
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
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      opacity 0.25s ease;
    transform: ${(props) =>
      props.isHidden ? "translateY(-100%)" : "translateY(0)"};
    opacity: ${(props) => (props.isHidden ? 0 : 1)};
  }

  @media (min-width: 501px) {
    /* Always visible on desktop */
    transform: translateY(0) !important;
    opacity: 1 !important;
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
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    -webkit-backdrop-filter: blur(7.8px);
    border: 1px solid rgba(255, 248, 248, 0.12);
  }
`;

const NavLink = styled(Link)`
  cursor: pointer;
  font-weight: 500;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #6366f1;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: left;
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
  font-weight: 400;
  @media (max-width: 500px) {
    font-size: 1.2rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3b82f6;
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

// Bottom bar with auto-hide functionality matching HTML example exactly
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

// Hook for navigation auto-hide - works for both top nav and bottom bar
const useNavigationAutoHide = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;

    const handleScroll = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Try different scroll sources
          const currentScroll =
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;

          // Also check if the scroll is from a container
          const target = e?.target;
          const containerScroll = target?.scrollTop || 0;

          // Use whichever is greater
          const scrollPos = Math.max(currentScroll, containerScroll);

          if (scrollPos <= 0) {
            setIsHidden(false);
            lastScroll = 0;
            ticking = false;
            return;
          }

          const scrollDifference = scrollPos - lastScroll;

          // More sensitive thresholds for better responsiveness
          if (scrollDifference > 5 && scrollPos > 80) {
            // Hide when scrolling down (threshold: 5px, minimum scroll: 80px)
            setIsHidden(true);
          } else if (scrollDifference < -3) {
            // Show when scrolling up (threshold: 3px - more sensitive for showing)
            setIsHidden(false);
          }

          lastScroll = scrollPos;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add a small delay to ensure DOM is ready
    const setupListeners = () => {
      // Listen to window scroll
      window.addEventListener("scroll", handleScroll, { passive: true });

      // Listen to document scroll
      document.addEventListener("scroll", handleScroll, { passive: true });

      // Find and listen to the scrollable container
      const scrollContainer = document.querySelector(".overflow-y-auto");
      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }

      // Also try to find any Locomotive Scroll container
      const locomotiveContainer = document.querySelector(
        "[data-scroll-container]"
      );
      if (locomotiveContainer) {
        locomotiveContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }

      // Listen to the main scroll container from App.jsx
      const mainScrollContainer = document.querySelector(
        "#main-scroll-container"
      );
      if (mainScrollContainer) {
        mainScrollContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }

      return { scrollContainer, locomotiveContainer, mainScrollContainer };
    };

    const { scrollContainer, locomotiveContainer, mainScrollContainer } =
      setupListeners();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
      if (locomotiveContainer) {
        locomotiveContainer.removeEventListener("scroll", handleScroll);
      }
      if (mainScrollContainer) {
        mainScrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return isHidden;
};

const Navigation = ({
  toggleTheme,
  showTodoMenu,
  setShowTodoMenu,
  showAuthCard,
  setShowAuthCard,
  isMenuOpen,
  setIsMenuOpen,
  mobileMenuRef,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const dropdownRef = useRef(null);

  // Initialize navigation auto-hide for both top nav and bottom bar
  const isNavigationHidden = useNavigationAutoHide();

  const letters = "Utility".split("");
  const reversedLetters = "Utility".split("").reverse();

  // Force dark theme on /contribute
  useEffect(() => {
    if (currentPath.startsWith("/contribute")) {
      if (localStorage.getItem("theme") !== "dark") {
        localStorage.setItem("theme", "dark");
        setIsDarkMode(true);
        if (typeof toggleTheme === "function") toggleTheme("dark");
      } else {
        setIsDarkMode(true);
      }
    }
  }, [currentPath, toggleTheme]);

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
    if (currentPath.startsWith("/contribute")) return;
    setIsDarkMode(!isDarkMode);
    toggleTheme();
  };

  // Define nav items for bottom bar
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/contributors", label: "Contribute", icon: Users },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck, auth: true },
    { to: "/essentials", label: "Essentials", icon: FaToolbox },
  ];

  return (
    <>
      <Nav isHidden={isNavigationHidden}>
        <NavContainer>
          <div className="flex items-center gap-2">
            <div className="content">
              <Logo to="/">
                <Title className="title">ಆರ್.ವಿ</Title>
              </Logo>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setShowUtilityMenu(true)}
              onMouseLeave={() => setShowUtilityMenu(false)}
              onClick={() => setShowUtilityMenu(!showUtilityMenu)}
              ref={dropdownRef}
            >
              <motion.div className="absolute inset-0 " />
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
                      className="inline-block md:text-xl cursor-pointer "
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
                      className="inline-block md:text-xl cursor-pointer"
                      style={{ transformOrigin: "50% 50%" }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
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
              GAMMA
            </BetaTag>
          </div>

          <NavLinks
            isOpen={isMenuOpen}
            ref={mobileMenuRef}
            onClick={() => setIsMenuOpen(false)}
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/contributors">Contribute</NavLink>
            <NavLink
              to={isAuthenticated && !isLoading && "/attendance"}
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthCard(!showAuthCard);
                }
              }}
            >
              Attendance
            </NavLink>
            <NavLink to="/essentials">Essentials</NavLink>
          </NavLinks>

          <div className="flex gap-1 sm:gap-4">
            <div className="flex items-center gap-3">
              {!isLoading ? (
                <button
                  className="relative group hover:shadow-[0_0_10px_2px_rgba(174,87,228,0.8)] rounded-full transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => setShowAuthCard(!showAuthCard)}
                  aria-label={
                    isAuthenticated
                      ? `Open profile menu for ${user?.name || "user"}`
                      : "Open authentication menu"
                  }
                  tabIndex={0}
                >
                  {isAuthenticated && user?.picture ? (
                    <span className="relative flex items-center">
                      <img
                        className="min-h-5 min-w-5 max-h-7 max-w-7 rounded-full cursor-pointer border-2 border-blue-400 group-hover:border-purple-500 transition-colors duration-200"
                        src={user.picture}
                        alt={user.name || "User profile"}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full w-3 h-3 animate-pulse"
                        title="Online"
                      ></span>
                    </span>
                  ) : (
                    <span className="relative flex items-center">
                      <AccountCircleIcon
                        className="text-gray-500 dark:text-gray-300 group-hover:text-purple-500 transition-colors duration-200"
                        fontSize="large"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 bg-red-400 border-2 border-white dark:border-gray-900 rounded-full w-3 h-3"
                        title="Not signed in"
                      ></span>
                    </span>
                  )}
                  <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                    {isAuthenticated ? user?.name || "Profile" : "Sign in"}
                  </span>
                </button>
              ) : (
                <LoadingSpinner>
                  <div className="spinner" />
                </LoadingSpinner>
              )}
            </div>
            <IconButton
              disabled={currentPath.startsWith("/contribute")}
              onClick={handleThemeToggle}
              style={{
                opacity: currentPath.startsWith("/contribute") && 0.3,
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <MobileMenuButton
              style={{ display: "none" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <Close /> : <Menu />}
            </MobileMenuButton>
          </div>
        </NavContainer>
      </Nav>

      {/* Bottom Bar with auto-hide - only show if not on /attendance or /contribute */}
      {!(
        currentPath.startsWith("/attendance") ||
        currentPath.startsWith("/contribute")
      ) && (
        <BottomBar>
          {navItems.map((item, idx) => {
            const isActive =
              item.to === "/"
                ? currentPath === "/"
                : currentPath.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "#6366f1" : "#a1a1aa",
                  textDecoration: "none",
                  flex: 1,
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  transition: "color 0.2s",
                  padding: "0.1rem 0",
                  gap: 1,
                }}
                onClick={
                  item.auth && !isAuthenticated
                    ? (e) => {
                        e.preventDefault();
                        setShowAuthCard(!showAuthCard);
                      }
                    : undefined
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  color={isActive ? "#6366f1" : "#a1a1aa"}
                />
                <span
                  style={{ fontSize: "0.75rem", marginTop: 2, fontWeight: 400 }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </BottomBar>
      )}
    </>
  );
};

export default Navigation;
