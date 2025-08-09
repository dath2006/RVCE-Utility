import React from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Home, BookOpen, Users, CalendarCheck } from "lucide-react";
import { FaToolbox } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigation } from "../contexts/NavigationContext";

// Bottom bar with auto-hide functionality matching HTML example exactly
const Bottombar = styled(motion.div)`
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
  transform: ${(props) => {
    return props.isHidden
      ? "translate3d(0, calc(100% + 2rem), 0)"
      : "translate3d(0, 0, 0)";
  }};
  opacity: ${(props) => (props.isHidden ? 0 : 1)};

  @supports (-webkit-touch-callout: none) {
    position: -webkit-sticky;
    position: sticky;
    bottom: calc(max(1.25rem, env(safe-area-inset-bottom, 0px)));
  }

  @media (min-width: 925px) {
    display: none;
  }
`;

// Define nav items for bottom bar
const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/contributors", label: "Contribute", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, auth: true },
  { to: "/essentials", label: "Essentials", icon: FaToolbox },
];

const BottomBar = ({ setShowAuthCard, showAuthCard }) => {
  const { isAuthenticated } = useAuth0();
  const { hideNavigation } = useNavigation();
  const location = useLocation();
  const currentPath = location.pathname;
  const shouldHide =
    currentPath.startsWith("/attendance") ||
    currentPath.startsWith("/contribute") ||
    hideNavigation; // Hide when any overlay is active

  if (shouldHide) return null;

  // Render in a portal attached to body to avoid transformed ancestors breaking fixed positioning
  return createPortal(
    <Bottombar>
      {navItems.map((item) => {
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
              minWidth: 0,
              fontWeight: 400,
              fontSize: "0.75rem",
              transition: "color 0.2s",
              padding: "0.35rem 0.25rem",
              gap: 2,
              lineHeight: 1,
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 18,
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                color={isActive ? "#6366f1" : "#a1a1aa"}
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
              {item.label}
            </span>
          </Link>
        );
      })}
    </Bottombar>,
    document.body
  );
};

export default BottomBar;
