import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { X } from "lucide-react";

// Styled components with improved design
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.glassbgc};
  color: ${({ theme }) => theme.text};
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 14px 28px ${({ theme }) => theme.shadow}22,
    0 10px 10px ${({ theme }) => theme.shadow}18;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  backdrop-filter: blur(12px);
  @media (max-width: 600px) {
    padding: 2rem 1rem 1.5rem 1rem;
    max-width: 95%;
    margin: 0 auto;
  }
`;

const CardHeader = styled.div`
  margin-bottom: 2rem;
  position: relative;
`;

const CardTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, #3a3aff, #6a6aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
`;

const CardDescription = styled.p`
  font-size: 1.1rem;
  color: ${(props) => props.theme.text};
  line-height: 1.5;
`;

const CardContent = styled.div`
  margin-bottom: 2rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: ${(props) => props.theme.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.875rem;
  }
`;

const Decoration = styled.div`
  position: absolute;

  &.blob-1 {
    top: -80px;
    right: -60px;
    width: 180px;
    height: 180px;
    background: radial-gradient(
      circle,
      rgba(139, 92, 246, 0.15),
      rgba(124, 58, 237, 0.05)
    );
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    z-index: -1;
  }

  &.blob-2 {
    bottom: -60px;
    left: -60px;
    width: 150px;
    height: 150px;
    background: radial-gradient(
      circle,
      rgba(56, 189, 248, 0.15),
      rgba(14, 165, 233, 0.05)
    );
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    z-index: -1;
  }

  &.accent-line {
    position: absolute;
    height: 4px;
    width: 60px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 2px;
    top: -12px;
    left: 0;
  }
`;

const CloseButton = styled(X)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: ${(props) => props.theme.surface};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => props.theme.text};
  font-size: 1.25rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  &:hover {
    background: ${(props) => props.theme.secondary};
    color: #3730a3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

// Custom Clerk button wrappers with styled-components
const StyledClerkButton = styled.div`
  flex: ${(props) => (props.fullwidth ? "1" : "initial")};
  width: ${(props) => (props.fullwidth ? "100%" : "auto")};
  button {
    width: 100%;
    height: 48px;
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    transition: all 0.3s ease !important;
    box-shadow: ${(props) =>
      props.primary
        ? `0 4px 14px ${props.theme.primary}44`
        : `0 6px 20px ${props.theme.primary}22`} !important;
    background: ${(props) =>
      props.primary ? props.theme.gradient : props.theme.surface};
    color: ${(props) => (props.primary ? "#fff" : props.theme.text)};
    border: 1.5px solid ${(props) => props.theme.primary};
    cursor: pointer;
    &:hover {
      transform: translateY(-2px) scale(1.03) !important;
      box-shadow: 0 8px 24px ${(props) => props.theme.primary}55 !important;
      background: ${(props) => props.theme.primary};
      color: #fff;
    }
    &:active {
      transform: translateY(0) scale(0.98) !important;
    }
  }
`;

// Animation variants with improved smoothness
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  exit: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25 } },
};

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
`;
const UserAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}33;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;
const UserName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;
const UserEmail = styled.div`
  font-size: 0.98rem;
  color: ${({ theme }) => theme.text}bb;
  word-break: break-all;
`;
const GradientAccent = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.gradient};
  border-radius: 8px 8px 0 0;
  margin-bottom: 1.5rem;
`;

// Main component
const PopupCard = ({ onClose, title, description, children }) => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();
  // Helper for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };
  return (
    <AnimatePresence>
      {
        <Overlay
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={() => onClose()}
        >
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <GradientAccent />
            <CloseButton onClick={() => onClose()} />
            <CardHeader as={motion.div} variants={contentVariants}>
              <Decoration className="accent-line" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            {/* User Info Section */}
            {isAuthenticated && user && (
              <UserInfoSection>
                <UserAvatar>
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} />
                  ) : (
                    getInitials(user.name)
                  )}
                </UserAvatar>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfoSection>
            )}
            <CardContent as={motion.div} variants={contentVariants}>
              {children}
              <ButtonGroup as={motion.div} variants={contentVariants}>
                {!isLoading && !isAuthenticated ? (
                  <StyledClerkButton primary fullwidth>
                    <button
                      onClick={() => {
                        loginWithRedirect();
                      }}
                    >
                      Sign In
                    </button>
                  </StyledClerkButton>
                ) : (
                  <StyledClerkButton fullwidth>
                    <button
                      onClick={() =>
                        logout({
                          logoutParams: { returnTo: window.location.origin },
                        })
                      }
                    >
                      Log out
                    </button>
                  </StyledClerkButton>
                )}
              </ButtonGroup>
            </CardContent>
          </Card>
        </Overlay>
      }
    </AnimatePresence>
  );
};

export default PopupCard;
