import React from "react";
import { Zap, Shield, BookOpen, Users, Code2, Laptop } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const features = [
  {
    title: "Select Your Choosen Courses",
    description:
      "Filter out the unwanted course and get access to your needed files faster and easier.",
    icon: Shield,
    color: "text-yellow-500",
    image: "/UserManual/selection.webp",
  },
  {
    title: "Files with inbuilt file reader",
    description:
      "Add required files to your workspace, View directly or else download.",
    icon: BookOpen,
    color: "text-green-500",
    image: "/UserManual/files.webp",
  },
  {
    title: "Power of Utility",
    description: "Open AI, GitHub Repo, Task Manager",
    icon: Zap,
    color: "text-blue-500",
    image: "/UserManual/utility.webp",
  },
  {
    title: "Practice Constitution Quizes",
    description: "Unit wise quizes for comprehensive learning.",
    icon: Users,
    color: "text-purple-500",
    image: "/UserManual/quiz.webp",
  },
  {
    title: "Workspace",
    description: "Add files that you open frequently and access easily.",
    icon: Code2,
    color: "text-red-500",
    image: "/UserManual/workspace.webp",
  },
  {
    title: "Cross-Platform Support",
    description:
      "Access your resources from any device with our responsive platform.",
    icon: Laptop,
    color: "text-indigo-500",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=400&q=80",
  },
];

const FeatureCard = ({ feature, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      key={feature.title}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
        ease: "easeOut",
      }}
      className={
        "rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group" +
        (localStorage.getItem("theme") === "dark"
          ? " bg-[#1a1a1a]"
          : " bg-[#ffffff]")
      }
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={feature.image}
          alt={feature.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div
            className={`p-2 rounded-full bg-white/90 ${feature.color} inline-block`}
          >
            <feature.icon size={20} />
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold  mb-2 group-hover:text-blue-500 transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
      <div className="px-6 pb-4">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">99%</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">New</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-medium text-white">Pro</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-12 mt-16">
        What we Provide ?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </>
  );
};

export default FeaturesSection;
