import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SelectionPopup from "./SelectionPopup";

const FirstVisit = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved ? JSON.parse(saved) : null;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleFeaturesComplete = () => {
    setShowPopup(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden px-4">
      <motion.div
        className="max-w-4xl w-full mx-auto text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 -mt-32 -mr-32"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white opacity-5 -mb-20 -ml-20"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 15,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Main content */}
        <motion.div
          className="relative z-20 backdrop-blur-sm bg-white/10 p-4 md:p-8 rounded-2xl shadow-2xl"
          variants={itemVariants}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-4 md:mb-6"
            variants={itemVariants}
          >
            Welcome to RVCE Resource Portal
          </motion.h1>

          <motion.div
            className="w-24 md:w-32 h-1 bg-gradient-to-r from-blue-300 to-purple-300 mx-auto mb-4 md:mb-8 rounded-full"
            variants={itemVariants}
          />

          <motion.p
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed"
            variants={itemVariants}
          >
            Access RVCE college resources in one place. Browse through study
            materials, notes, and more with our easy-to-use interface.
          </motion.p>

          <motion.button
            className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ease-in-out"
            variants={itemVariants}
            whilehover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(120, 120, 255, 0.5)",
            }}
            whiletap={{ scale: 0.98 }}
            onClick={handleFeaturesComplete}
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <SelectionPopup
            onClose={() => setShowPopup(false)}
            onSubmit={(selectedFilters) => {
              setFilters(selectedFilters);
              localStorage.setItem("filters", JSON.stringify(selectedFilters));
              navigate("/resources");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstVisit;
