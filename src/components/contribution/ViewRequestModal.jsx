import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiX, FiEye, FiClock, FiUpload } from "react-icons/fi";

const ViewRequestModal = ({
  modalVariants,
  setIsViewModalOpen,
  selectedRequest,
  setActiveUpload,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 w-full max-w-2xl lg:max-w-5xl max-h-[85vh] overflow-y-auto mt-6"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <FiEye className="text-indigo-400" />
              Request Details
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Request Info */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-sm">Subject Code</p>
                  <p className="text-white font-medium break-all">
                    {selectedRequest.subjectCode || "Untitled Request"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">User</p>
                  <p className="text-indigo-400 font-medium">
                    {"@"}
                    {selectedRequest.user.split(".")[0]}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Branch</p>
                  <p className="text-white font-medium">
                    {selectedRequest.branch}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Semester</p>
                  <p className="text-white font-medium">
                    {parseInt(selectedRequest.semester) === 1
                      ? "C Cycle"
                      : parseInt(selectedRequest.semester) === 2
                      ? "P Cycle"
                      : `Sem ${selectedRequest.semester}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Subject</p>
                  <p className="text-white font-medium">
                    {selectedRequest.subject || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    Posted
                  </p>
                  <p className="text-white font-medium">
                    {new Date(selectedRequest.postedAt).toLocaleDateString()}{" "}
                  </p>
                </div>
              </div>
            </div>

            {/* Requested Items */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <FiUpload className="text-slate-400" />
                Requested Items ({selectedRequest.documents.length})
              </h3>{" "}
              <div className="space-y-4">
                {selectedRequest.documents.map((item, index) => {
                  if (
                    !item.files ||
                    !item.files.some((file) =>
                      ["reviewing", "approved"].includes(file.status)
                    )
                  ) {
                    return (
                      <div
                        key={item._id || item.name || index}
                        className="relative"
                      >
                        <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                          {/* Mobile Layout */}
                          <div className="block sm:hidden">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className={`h-3 w-3 rounded-full flex-shrink-0 ${
                                  item.type === "Notes"
                                    ? "bg-blue-500"
                                    : item.type === "QP"
                                    ? "bg-green-500"
                                    : item.type === "Textbook"
                                    ? "bg-purple-500"
                                    : "bg-amber-500"
                                }`}
                              ></div>
                              <h4 className="text-slate-200 font-medium flex-1 min-w-0">
                                {item.name}
                              </h4>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                                  item.type === "Notes"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : item.type === "QP"
                                    ? "bg-green-900/30 text-green-400"
                                    : item.type === "Textbook"
                                    ? "bg-purple-900/30 text-purple-400"
                                    : "bg-amber-900/30 text-amber-400"
                                }`}
                              >
                                {item.type}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                              {item.description || selectedRequest.description}
                            </p>
                            <button
                              onClick={() => setActiveUpload(index)}
                              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
                            >
                              <FiUpload className="w-4 h-4" />
                              Contribute File
                            </button>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:block">
                            <div className="flex items-start gap-4">
                              <div
                                className={`h-3 w-3 rounded-full flex-shrink-0 mt-1 ${
                                  item.type === "Notes"
                                    ? "bg-blue-500"
                                    : item.type === "QP"
                                    ? "bg-green-500"
                                    : item.type === "Textbook"
                                    ? "bg-purple-500"
                                    : "bg-amber-500"
                                }`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h4 className="text-slate-200 font-medium">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span
                                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                                        item.type === "Notes"
                                          ? "bg-blue-900/30 text-blue-400"
                                          : item.type === "QP"
                                          ? "bg-green-900/30 text-green-400"
                                          : item.type === "Textbook"
                                          ? "bg-purple-900/30 text-purple-400"
                                          : "bg-amber-900/30 text-amber-400"
                                      }`}
                                    >
                                      {item.type}
                                    </span>
                                    <button
                                      onClick={() => setActiveUpload(index)}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                                    >
                                      <FiUpload className="w-4 h-4" />
                                      Contribute
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                  {item.description ||
                                    selectedRequest.description}
                                </p>
                              </div>
                            </div>{" "}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewRequestModal;
