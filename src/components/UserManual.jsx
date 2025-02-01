import React, { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import styled from "styled-components";
import { AnimatePresence } from "framer-motion";
import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

// const CompleteButton = styled(motion.button)`
//   position: absolute;
//   bottom: 20px;
//   right: 20px;
//   padding: 0.75rem 1.5rem;
//   background: ${(props) => props.theme.gradient};
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-weight: 600;
//   cursor: pointer;
// `;

// const SkipButton = styled(motion.button)`
//   position: absolute;
//   top: -40px;
//   right: 0;
//   padding: 0.5rem 1rem;
//   background: ${(props) => props.theme.surface};
//   color: ${(props) => props.theme.text};
//   border: 1px solid ${(props) => props.theme.border};
//   border-radius: 6px;
//   font-weight: 500;
//   cursor: pointer;
//   z-index: 10;

//   &:hover {
//     background: ${(props) => props.theme.secondary};
//   }
// `;

// const manualImages = [
//   {
//     url: "/UserManual/1.png",
//     caption: "Getting Started",
//   },
//   {
//     url: "UserManual/2.png",
//     caption: "Course Selection",
//   },
//   {
//     url: "UserManual/3.png",
//     caption: "Resources Guide",
//   },
//   {
//     url: "UserManual/4.png",
//     caption: "Workspace Tab",
//   },
//   {
//     url: "UserManual/5.png",
//     caption: "Quizzes Guide",
//   },
//   {
//     url: "UserManual/6.png",
//     caption: "Utility Dropdown",
//   },
//   {
//     url: "UserManual/7.png",
//     caption: "Give feedback!",
//   },
// ];

// function UserManual({ onComplete, onSkip, firstVisit }) {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const isLastSlide = currentSlide === manualImages.length - 1;

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % manualImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide(
//       (prev) => (prev - 1 + manualImages.length) % manualImages.length
//     );
//   };

//   return (
//     <div className="mb-16 mt-9">
//       <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
//         <BookOpen className="w-6 h-6 mr-2" />
//         User Manual
//       </h2>
//       <div className="relative">
//         {firstVisit && (
//           <SkipButton
//             onClick={onSkip}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Skip Tutorial
//           </SkipButton>
//         )}
//         <div className="overflow-hidden rounded-lg h-[500px] bg-gray-100">
//           <div className="relative h-full">
//             <img
//               src={manualImages[currentSlide].url}
//               alt={manualImages[currentSlide].caption}
//               className="w-full h-full object-contain "
//             />
//             <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
//               <p className="text-lg font-semibold">
//                 {manualImages[currentSlide].caption}
//               </p>
//             </div>
//           </div>
//         </div>
//         <button
//           onClick={prevSlide}
//           className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-500 p-2 rounded-full shadow-lg hover:bg-gray-400"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>
//         <button
//           onClick={nextSlide}
//           className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-500 p-2 rounded-full shadow-lg hover:bg-gray-400"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>

//         <AnimatePresence>
//           {isLastSlide && firstVisit && (
//             <CompleteButton
//               onClick={() => onComplete()}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               Complete Tutorial
//             </CompleteButton>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

function useParallax(value = parseInt(MotionValue), distance) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function Image({ id }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 300);

  return (
    <section className="img-container">
      <div ref={ref}>
        <img src={`/UserManual/${id}.png`} alt="How to use" />
      </div>
      <motion.h2
        initial={{ visibility: "hidden" }}
        animate={{ visibility: "visible" }}
        style={{ y }}
      >{`#00${id}`}</motion.h2>
    </section>
  );
}

export default function UserManual() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div id="example">
      {[1, 2, 3, 4, 5, 6, 7].map((image) => (
        <Image key={image} id={image} />
      ))}
      <motion.div className="progress" style={{ scaleX }} />
      <StyleSheet />
    </div>
  );
}

function StyleSheet() {
  return (
    <style>{`
      html {
          scroll-snap-type: y mandatory;
      }

      .img-container {
          height: 100vh;
          scroll-snap-align: start;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
      }

      .img-container > div {
          width: 300px;
          height: 400px;
          margin: 20px;
          background: #f5f5f5;
          overflow: hidden;
      }

      .img-container img {
          width: 300px;
          height: 400px;
      }

      @media (max-width: 500px) {
          .img-container > div {
              width: 150px;
              height: 200px;
          }

          .img-container img {
              width: 150px;
              height: 200px;
          }
      }

      .img-container h2 {
          color: #4ff0b7;
          margin: 0;
          font-family: JetBrains Mono, monospace;
          font-size: 50px;
          font-weight: 700;
          letter-spacing: -3px;
          line-height: 1.2;
          position: absolute;
          display: inline-block;
          top: calc(50% - 25px);
          left: calc(50% + 120px);
      }

      .progress {
          position: fixed;
          left: 0;
          right: 0;
          height: 5px;
          background: #4ff0b7;
          bottom: 50px;
          transform: scaleX(0);
      }
  `}</style>
  );
}
