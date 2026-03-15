import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

const FilterRequests = ({
  clearFilters,
  hasActiveFilters,
  searchQuery,
  setSearchQuery,
  filters,
  handleFilterChange,
  onClose,
}) => {
  const content = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filter Requests</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition hover:bg-accent sm:hidden"
            aria-label="Close filters"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subject, user, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Semester
          </label>
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className={inputClass}
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
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Branch
          </label>
          <select
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className={inputClass}
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
            ].map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[94] bg-black/45 backdrop-blur-[1px] sm:hidden"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-x-2 bottom-0 z-[95] max-h-[calc(100dvh-var(--app-nav-offset,88px)-0.5rem)] overflow-y-auto rounded-t-2xl border border-border/70 bg-card/95 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-xl backdrop-blur sm:hidden"
      >
        {content}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 z-20 mt-2 hidden w-96 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-xl backdrop-blur sm:block"
      >
        {content}
      </motion.div>
    </>
  );
};

export default FilterRequests;
