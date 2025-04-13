import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = ({ isLoading, onLoadingComplete, screenSize }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scale: screenSize < 700 ? 1 : 1.4, z: 0 }}
          exit={{
            scale: 1.1,
            opacity: 0,
            z: -100,
            transition: {
              duration: 1.4,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            backgroundImage:
              screenSize < 700 ? 'url("/BGM.webp")' : 'url("/BG.webp")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            width: "100%",
            height: "98vh",
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
