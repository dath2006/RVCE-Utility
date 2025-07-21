import React from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiX,
  FiTag,
  FiCalendar,
  FiBook,
  FiUpload,
  FiFileText,
} from "react-icons/fi";
import { File } from "lucide-react";
import WaveLoader from "../Loading";

const AddRequest = ({
  modalVariants,
  setIsAddModalOpen,
  handleAddRequest,
  newRequest,
  setNewRequest,
  addNewItem,
  updateItem,
  removeItem,
  isLoading,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 w-full max-w-2xl  max-h-[90vh] "
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <WaveLoader
              size="3em"
              primaryColor="hsl(220,90%,50%)"
              secondaryColor="hsl(300,90%,50%)"
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiPlus className="text-indigo-400" />
                Create New Request
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRequest} className="space-y-8">
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FiTag className="inline w-4 h-4 mr-1" />
                      Branch
                    </label>
                    <select
                      value={newRequest.branch}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          branch: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Branch</option>
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
                        <option key={`${branch}-${index}--`} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      Semester
                    </label>
                    <select
                      value={newRequest.semester}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          semester: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Semester</option>
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FiBook className="inline w-4 h-4 mr-1" />
                      Subject Code
                    </label>
                    <input
                      type="text"
                      value={newRequest.subjectCode}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          subjectCode: e.target.value,
                        }))
                      }
                      placeholder="Enter subject code"
                      className="w-full bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <File className="inline w-4 h-4 mr-1" />
                      Subject Name
                    </label>
                    <input
                      type="text"
                      value={newRequest.subject}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Enter subject name"
                      className="w-full bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      <FiUpload className="inline w-4 h-4 mr-1" />
                      Requested Items
                    </label>
                    <button
                      type="button"
                      onClick={addNewItem}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newRequest.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-slate-900/50 rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-5 transition-all duration-200 hover:border-slate-600/50"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                updateItem(index, "name", e.target.value)
                              }
                              placeholder="Item name (e.g., Unit 5 sensors)"
                              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                              required
                            />
                            <select
                              value={item.type}
                              onChange={(e) =>
                                updateItem(index, "type", e.target.value)
                              }
                              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Notes">Notes</option>
                              <option value="QP">Question Paper</option>
                              <option value="Textbook">Textbook</option>
                              <option value="Lab">Lab</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                <FiFileText className="inline w-4 h-4 mr-1" />
                                Description
                              </label>
                              <textarea
                                value={item.description}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="(e.g. handwritten notes made by RSA mam)"
                                rows={1}
                                className="w-full bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                maxLength={200}
                              />
                            </div>
                          </div>
                          {newRequest.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 ">
                <button
                  disabled={isLoading}
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AddRequest;
