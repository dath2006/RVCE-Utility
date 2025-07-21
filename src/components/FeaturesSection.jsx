import React, { useEffect, useState, useRef } from "react";
import {
  Zap,
  Shield,
  BookOpen,
  Users,
  Code2,
  Laptop,
  Upload,
  Smartphone,
} from "lucide-react";
import { useSwipeable } from "react-swipeable";

const features = [
  {
    title: "Select Your Choosen Courses",
    description:
      "Filter out the unwanted course and get access to your needed files faster and easier.",
    icon: Shield,
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    gradient: "from-yellow-500 to-amber-400",
  },
  {
    title: "Files with inbuilt file reader",
    description:
      "Add required files to your workspace, View directly or else download.",
    icon: BookOpen,
    color: "bg-green-500",
    textColor: "text-green-500",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    title: "Power of Utility",
    description: "Open AI, GitHub Repo, Task Manager",
    icon: Zap,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Practice Constitution Quizes",
    description: "Unit wise quizes for comprehensive learning.",
    icon: Users,
    color: "bg-purple-500",
    textColor: "text-purple-500",
    gradient: "from-purple-500 to-violet-400",
  },
  {
    title: "Workspace",
    description: "Add files that you open frequently and access easily.",
    icon: Code2,
    color: "bg-red-500",
    textColor: "text-red-500",
    gradient: "from-red-500 to-rose-400",
  },
  {
    title: "Attendance Manager",
    description:
      "Track your attendance and get notified about your attendance status.",
    icon: Laptop,
    color: "bg-indigo-500",
    textColor: "text-indigo-500",
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    title: "Expanding Resources",
    description:
      "Contribute to the community by adding college resources and files.",
    icon: Upload,
    color: "bg-pink-500",
    textColor: "text-pink-500",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    title: "Cross-Platform Support",
    description:
      "Access your resources from any device with our responsive platform.",
    icon: Smartphone,
    color: "bg-teal-500",
    textColor: "text-teal-500",
    gradient: "from-teal-500 to-emerald-400",
  },
];

const FeatureCard = ({ feature, isActive }) => {
  return (
    <div
      className={`transition-all duration-700 ${
        isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"
      }`}
    >
      <div
        className={`
        rounded-2xl p-8 bg-gradient-to-br ${feature.gradient} shadow-lg 
        h-[28rem] w-full max-w-xl mx-auto flex flex-col
        transform transition-all duration-700
      `}
      >
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-6 shadow-xl">
            <feature.icon
              size={48}
              className={feature.textColor}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h3 className="text-3xl font-bold mb-6 text-white text-center">
          {feature.title}
        </h3>

        <p className="text-white/90 leading-relaxed text-lg text-center mb-8 flex-grow">
          {feature.description}
        </p>

        <div className="flex justify-center space-x-3 mt-auto">
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
        </div>
      </div>
    </div>
  );
};

// Fixed floating icons that won't overlap
const FloatingIcons = () => {
  // Pre-defined positions to avoid overlapping
  const iconPositions = [
    { top: "10%", left: "5%", animation: "animate-float-slow", size: 32 },
    { top: "15%", left: "80%", animation: "animate-float-medium", size: 48 },
    { top: "30%", left: "15%", animation: "animate-float-fast", size: 24 },
    { top: "40%", left: "90%", animation: "animate-float-slow", size: 36 },
    { top: "60%", left: "8%", animation: "animate-float-medium", size: 42 },
    { top: "70%", left: "85%", animation: "animate-float-fast", size: 28 },
    { top: "85%", left: "20%", animation: "animate-float-slow", size: 38 },
    { top: "90%", left: "70%", animation: "animate-float-medium", size: 30 },
  ];

  const icons = [
    Shield,
    BookOpen,
    Zap,
    Users,
    Code2,
    Laptop,
    Upload,
    Smartphone,
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      {icons.map((Icon, index) => {
        const position = iconPositions[index];
        return (
          <div
            key={index}
            className={`absolute ${position.animation}`}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <Icon
              size={position.size}
              className="text-gray-600 dark:text-gray-300"
              strokeWidth={1}
            />
          </div>
        );
      })}
    </div>
  );
};

const FeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [direction, setDirection] = useState("right");
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setDirection("right");
      setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
    },
    onSwipedRight: () => {
      setDirection("left");
      setActiveIndex(
        (prevIndex) => (prevIndex - 1 + features.length) % features.length
      );
    },
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: false,
  });

  useEffect(() => {
    // Add custom animation classes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes float-medium {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-15px) rotate(-5deg); }
      }
      @keyframes float-fast {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-10px) rotate(10deg); }
      }
      .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
      .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const isInView =
        rect.top <= window.innerHeight * 0.5 &&
        rect.bottom >= window.innerHeight * 0.5;

      if (isInView && !isScrolling) {
        setIsScrolling(true);

        // Clear existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Set new interval
        intervalRef.current = setInterval(() => {
          setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
        }, 3000);
      } else if (!isInView && isScrolling) {
        setIsScrolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isScrolling]);

  const handleDotClick = (index) => {
    setActiveIndex(index);

    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
  };

  return (
    <div
      className="py-20 relative min-h-screen flex flex-col justify-center"
      ref={sectionRef}
    >
      <FloatingIcons />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          What We Provide
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the powerful features that make RVCE Utility Portal your
          go-to platform for academic resources
        </p>
      </div>

      <div
        className="relative h-[28rem] flex items-center justify-center px-4"
        {...swipeHandlers}
      >
        {features.map((feature, index) => {
          let cardDirection = "right";
          if (index === activeIndex) cardDirection = direction;
          else if (index < activeIndex) cardDirection = "left";
          return (
            <div
              key={feature.title}
              className={`absolute transition-all duration-700 w-full pointer-events-none ${
                index === activeIndex ? "z-20" : "z-0"
              }`}
            >
              <FeatureCard
                feature={feature}
                isActive={index === activeIndex}
                direction={cardDirection}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-12 space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex
                ? "bg-blue-600 w-8"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => handleDotClick(index)}
            aria-label={`View feature ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
