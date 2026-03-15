import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

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

// Main component
const PopupCard = ({ onClose, title, description, children }) => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
        onClick={() => onClose()}
      >
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[30rem]"
        >
          <Card className="relative overflow-hidden border-border/70 bg-card shadow-2xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onClose()}
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader
              as={motion.div}
              variants={contentVariants}
              className="relative pb-4 pt-7"
            >
              <CardTitle className="text-3xl font-bold text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {description}
              </CardDescription>
            </CardHeader>

            {isAuthenticated && user && (
              <div className="mb-5 flex flex-col items-center gap-2 px-6">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-foreground">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="break-all text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}

            <CardContent
              as={motion.div}
              variants={contentVariants}
              className="space-y-6"
            >
              {children}
              <motion.div
                variants={contentVariants}
                className="flex flex-col gap-2 sm:flex-row"
              >
                {!isLoading && !isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={() => {
                      loginWithRedirect();
                    }}
                    className="h-11 flex-1"
                  >
                    Sign In
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1"
                    onClick={() =>
                      logout({
                        logoutParams: { returnTo: window.location.origin },
                      })
                    }
                  >
                    Log out
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopupCard;
