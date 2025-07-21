import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";

const FilterRequests = ({
  clearFilters,
  hasActiveFilters,
  searchQuery,
  setSearchQuery,
  filters,
  handleFilterChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: "spring", damping: 20 }}
      className="absolute right-0 mt-2 w-72 sm:w-96 bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 z-20 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Filter Requests</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
          >
            <FiX className="text-sm" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Search
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects, users, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Semester
          </label>
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            <option value={1}>Chem Cycle</option>
            <option value={2}>Phy Cycle</option>
            {[3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                Semester {num}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Branch
          </label>
          <select
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {[
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
            ].map((branch, index) => (
              <option key={`-${index}-kkf${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Subject
          </label>
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {[
              "Maths",
              "Physics",
              "Chemistry",
              "Biology",
              "Programming",
              "Electronics",
            ].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div> */}
      </div>
    </motion.div>
  );
};

export default FilterRequests;
