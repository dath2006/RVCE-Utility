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
        "rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative" +
        (localStorage.getItem("theme") === "dark"
          ? " bg-[#1a1a1a] border border-gray-800"
          : " bg-white border border-gray-100")
      }
      whileHover={{ y: -5 }}
    >
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={feature.image}
          alt={feature.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <div
            className={`p-3 rounded-xl bg-white/95 ${feature.color} inline-block shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            <feature.icon size={24} />
          </div>
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
          {feature.description}
        </p>
      </div>
      <div className="px-8 pb-6">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-sm font-semibold text-white">99%</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-sm font-semibold text-white">New</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-sm font-semibold text-white">Pro</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">What We Provide</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the powerful features that make RVCE Utility Portal your
          go-to platform for academic resources
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
