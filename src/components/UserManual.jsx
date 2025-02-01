import React, { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const CompleteButton = styled(motion.button)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 0.75rem 1.5rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const manualImages = [
  {
    url: "/UserManual/1.png",
    caption: "Getting Started",
  },
  {
    url: "UserManual/2.png",
    caption: "Course Selection",
  },
  {
    url: "UserManual/3.png",
    caption: "Resources Guide",
  },
  {
    url: "UserManual/4.png",
    caption: "Workspace Tab",
  },
  {
    url: "UserManual/5.png",
    caption: "Quizzes Guide",
  },
  {
    url: "UserManual/6.png",
    caption: "Utility Dropdown",
  },
  {
    url: "UserManual/7.png",
    caption: "Give feedback!",
  },
];

function UserManual({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === manualImages.length - 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % manualImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + manualImages.length) % manualImages.length
    );
  };

  return (
    <div className="mb-16 mt-9">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-2" />
        User Manual
      </h2>
      <div className="relative">
        <div className="overflow-hidden rounded-lg h-[500px] bg-gray-100">
          <div className="relative h-full">
            <img
              src={manualImages[currentSlide].url}
              alt={manualImages[currentSlide].caption}
              className="w-full h-full object-contain "
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p className="text-lg font-semibold">
                {manualImages[currentSlide].caption}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-500 p-2 rounded-full shadow-lg hover:bg-gray-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-500 p-2 rounded-full shadow-lg hover:bg-gray-400"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <AnimatePresence>
          {isLastSlide && (
            <CompleteButton
              onClick={() => onComplete()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Complete Tutorial
            </CompleteButton>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UserManual;
