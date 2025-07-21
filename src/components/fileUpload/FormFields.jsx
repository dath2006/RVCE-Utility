import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FormFields = ({ formData, onChange }) => {
  const branchOptions = [
    "CSE",
    "ISE",
    "ECE",
    "EEE",
    "CV",
    "AIML",
    "BT",
    "CD",
    "CY",
    "ET",
    "AS",
    "CH",
    "IM",
    "ME",
  ];

  const docTypeOptions = [
    "Notes",
    "Question Paper",
    "Lab Manual",
    "Textbook",
    "Other",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
    >
      {/* Semester Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Semester *
        </label>
        <div className="relative">
          <select
            value={formData.semester}
            onChange={(e) => onChange("semester", e.target.value)}
            className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4 text-white transition-all duration-200 hover:border-slate-600/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          >
            <option value="">Select Semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option
                key={i + 1}
                value={String(i + 1)}
                className="bg-slate-800 text-white"
              >
                {i === 0
                  ? "Chemistry Cycle"
                  : i === 1
                  ? "Physics Cycle"
                  : `Semester ${i + 1}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Branch Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Branch *
        </label>
        <div className="relative">
          <select
            value={formData.branch}
            onChange={(e) => onChange("branch", e.target.value)}
            className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4 text-white transition-all duration-200 hover:border-slate-600/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          >
            <option value="">Select Branch</option>
            {branchOptions.map((branch) => (
              <option
                key={branch}
                value={branch}
                className="bg-slate-800 text-white"
              >
                {branch}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Subject Code Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Subject Code *
        </label>
        <input
          type="text"
          placeholder="Enter subject code (e.g., CS222IA)"
          value={formData.subjectCode}
          onChange={(e) => {
            if (e.target.value.length <= 10) {
              onChange("subjectCode", e.target.value.trim().toUpperCase());
            }
          }}
          className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4 text-white placeholder-slate-400 transition-all duration-200 hover:border-slate-600/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Subject Name Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Subject Name *
        </label>
        <input
          type="text"
          placeholder="Enter subject name (e.g., C Programming)"
          value={formData.subjectName}
          onChange={(e) => {
            if (e.target.value.length <= 50) {
              onChange("subjectName", e.target.value.trim() || "");
            }
          }}
          className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4 text-white placeholder-slate-400 transition-all duration-200 hover:border-slate-600/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Document Type Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Document Type *
        </label>
        <div className="relative">
          <select
            value={formData.docType}
            onChange={(e) => onChange("docType", e.target.value)}
            className="w-full bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4 text-white transition-all duration-200 hover:border-slate-600/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          >
            <option className="bg-slate-800 text-white" value="">
              Select Type
            </option>
            <option className="bg-slate-800 text-white" value="Notes">
              Notes
            </option>
            <option className="bg-slate-800 text-white" value="QP">
              Question Paper
            </option>
            <option className="bg-slate-800 text-white" value="Textbook">
              Textbook
            </option>
            <option className="bg-slate-800 text-white" value="Lab">
              Lab
            </option>
            <option className="bg-slate-800 text-white" value="Other">
              Other
            </option>
            {/* {docTypeOptions.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-slate-800 text-white"
              >
                {type}
              </option>
            ))} */}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export default FormFields;
