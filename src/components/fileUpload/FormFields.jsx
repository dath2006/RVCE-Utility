import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const fieldBaseClass =
  "w-full rounded-xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Semester
        </label>
        <div className="relative">
          <select
            value={formData.semester}
            onChange={(e) => onChange("semester", e.target.value)}
            className={`${fieldBaseClass} appearance-none pr-9`}
          >
            <option value="">Select Semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i === 0
                  ? "Chemistry Cycle"
                  : i === 1
                    ? "Physics Cycle"
                    : `Semester ${i + 1}`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Branch
        </label>
        <div className="relative">
          <select
            value={formData.branch}
            onChange={(e) => onChange("branch", e.target.value)}
            className={`${fieldBaseClass} appearance-none pr-9`}
          >
            <option value="">Select Branch</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Subject Code
        </label>
        <input
          type="text"
          placeholder="Example: CS222IA"
          value={formData.subjectCode}
          onChange={(e) => {
            if (e.target.value.length <= 10) {
              onChange("subjectCode", e.target.value.trim().toUpperCase());
            }
          }}
          className={fieldBaseClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Subject Name
        </label>
        <input
          type="text"
          placeholder="Example: C Programming"
          value={formData.subjectName}
          onChange={(e) => {
            if (e.target.value.length <= 50) {
              onChange("subjectName", e.target.value.trim() || "");
            }
          }}
          className={fieldBaseClass}
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Document Type
        </label>
        <div className="relative max-w-sm">
          <select
            value={formData.docType}
            onChange={(e) => onChange("docType", e.target.value)}
            className={`${fieldBaseClass} appearance-none pr-9`}
          >
            <option value="">Select Type</option>
            <option value="Notes">Notes</option>
            <option value="QP">Question Paper</option>
            <option value="Textbook">Textbook</option>
            <option value="Lab">Lab</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
};

export default FormFields;
