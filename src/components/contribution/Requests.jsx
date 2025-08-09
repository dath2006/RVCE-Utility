import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiFilter,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiEye,
  FiX,
  FiSearch,
  FiUpload,
  FiBook,
  FiFileText,
  FiUser,
  FiCalendar,
  FiTag,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "react-toastify";
import FilterRequests from "./FilterRequests";
import AddRequest from "./AddRequest";

import ViewRequestModal from "./ViewRequestModal";

import WaveLoader from "../Loading";
import useBottomBarVisibility from "../../hooks/useBottomBarVisibility";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const Requests = () => {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    getAccessTokenSilently,
  } = useAuth0();
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    semester: "",
    branch: "",
    subject: "",
    subjectCode: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    branch: "",
    semester: "",
    subject: "",
    subjectCode: "",
    items: [{ name: "", type: "Notes", description: "" }],
  });
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingCancelIndex, setPendingCancelIndex] = useState(null);
  const filterRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use bottom bar visibility hooks for modals
  useBottomBarVisibility(isAddModalOpen, "add-request-modal");
  useBottomBarVisibility(!!activeUpload, "upload-modal");
  useBottomBarVisibility(showCancelConfirm, "cancel-confirm-modal");

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch requests from the server
  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || isAuthLoading) return;
      try {
        setIsLoadingRequests(true);
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/requests?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequests(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again later.");
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ semester: "", branch: "", subject: "" });
    setSearchQuery("");
  };

  const hasActiveFilters =
    Object.values(filters).some((filter) => filter !== "") ||
    searchQuery !== "";

  // Handle adding new request
  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/requests`,
        {
          ...newRequest,
          email: user.email,
          fullName: user.name,
          image: user.picture,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // setRequests((prev) => [...prev, response.data.request]);
        setIsAddModalOpen(false);
        setNewRequest({
          branch: "",
          semester: "",
          subject: "",
          subjectCode: "",
          items: [{ name: "", type: "Notes", description: "" }],
        });
        toast.success("Request created successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error creating request:", err);
      alert("Failed to create request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.documents.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSemester =
      filters.semester === "" ||
      request.semester.toString() === filters.semester;
    const matchesBranch =
      filters.branch === "" || request.branch === filters.branch;

    return matchesSearch && matchesSemester && matchesBranch;
  });
  const handleFileSelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds 20MB limit");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX and TXT files are allowed"
      );
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [index]: file }));
  };

  const handleUpload = async (index) => {
    const file = selectedFiles[index];
    if (!file || !isAuthenticated) return;
    const document = selectedRequest.documents[activeUpload];
    if (!document) return;
    const uploadSessionId = crypto.randomUUID();
    try {
      setIsUploading(true);
      setActiveUpload(index);
      setUploadProgress((prev) => ({ ...prev, [index]: 0 }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("reqId", selectedRequest._id);
      formData.append("contributedBy", user.email);
      formData.append("contributedAt", new Date());
      formData.append("docId", document._id);
      formData.append("uploadSessionId", uploadSessionId);
      formData.append("request", JSON.stringify(selectedRequest));
      formData.append(
        "user",
        JSON.stringify({
          fullName: user.name,
          email: user.email,
          imageUrl: user.picture,
        })
      );
      const token = await getAccessTokenSilently();

      const response = await axios.post(
        `${import.meta.env.VITE_UPLOAD_URL}/contribute`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({
              ...prev,
              [index]: percentCompleted,
            }));
          },
        }
      );

      if (response.data.success) {
        toast.success("File uploaded successfully");
        // Auto-close after successful upload
        setTimeout(() => {
          setActiveUpload(null);
          setSelectedFiles((prev) => ({ ...prev, [index]: null }));
          setUploadProgress((prev) => ({ ...prev, [index]: 0 }));
        }, 1000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
      setActiveUpload(null);
      setUploadProgress((prev) => ({ ...prev, [index]: 0 }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = (index) => {
    if (uploadProgress[index] > 0 && uploadProgress[index] < 100) return;

    if (selectedFiles[index]) {
      setShowCancelConfirm(true);
      setPendingCancelIndex(index);
    } else {
      setActiveUpload(null);
    }
  };

  const confirmCancel = () => {
    setActiveUpload(null);
    setSelectedFiles((prev) => ({ ...prev, [pendingCancelIndex]: null }));
    setUploadProgress((prev) => ({ ...prev, [pendingCancelIndex]: 0 }));
    setShowCancelConfirm(false);
    setPendingCancelIndex(null);
  };

  const addNewItem = () => {
    setNewRequest((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", type: "Notes" }],
    }));
  };

  const removeItem = (index) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  return (
    <div className="requests-container w-full h-full p-4 md:p-6 bg-slate-900 overflow-hidden">
      {/* Header Section */}
      <motion.div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Resource Requests
          </h1>
          <p className="text-slate-400 text-sm">
            {filteredRequests.length} request
            {filteredRequests.length !== 1 ? "s" : ""} found
          </p>
        </motion.div>

        <motion.div
          className="flex sm:flex-row gap-3  lg:w-auto"
          variants={itemVariants}
        >
          <motion.button
            whilehover={{ scale: 1.03 }}
            whiletap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <FiPlus className="text-lg" />
            <span>Add Request</span>
          </motion.button>

          <div className="relative" ref={filterRef}>
            <motion.button
              whilehover={{ scale: 1.03 }}
              whiletap={{ scale: 0.97 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                hasActiveFilters
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
            >
              <FiFilter className="text-lg" />
              <span>Filters</span>
              {hasActiveFilters && (
                <motion.span
                  className="bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {Object.values(filters).filter((f) => f !== "").length +
                    (searchQuery !== "" ? 1 : 0)}
                </motion.span>
              )}
              <FiChevronDown
                className={`transition-transform duration-200 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {isFilterOpen && (
                <FilterRequests
                  clearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {searchQuery && (
              <motion.span
                className="inline-flex items-center gap-1 bg-indigo-900/30 text-indigo-300 text-sm px-3 py-1 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-indigo-200"
                >
                  <FiX className="text-xs" />
                </button>
              </motion.span>
            )}
            {Object.entries(filters).map(
              ([key, value], index) =>
                value && (
                  <motion.span
                    key={`${key}ddf${index}`}
                    className="inline-flex items-center gap-1 bg-slate-700 text-slate-200 text-sm px-3 py-1 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {key}: {value}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, [key]: "" }))
                      }
                      className="hover:text-white"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </motion.span>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests Grid */}
      {isLoadingRequests ? (
        <div className="flex items-center justify-center py-12">
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-slate-300">{error}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 overflow-y-auto max-h-[calc(100vh-215px)] pb-40"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredRequests.map((request, index) => (
            <motion.div
              key={
                request._id
                  ? `${request._id}dfd${index}`
                  : `fallback-key-${index}`
              }
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 flex flex-col h-full"
              variants={itemVariants}
              whilehover="hover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Request Header */}
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 p-4 border-b border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-lg font-semibold text-white">
                      {request.subjectCode || "Untitled Request"}
                    </h2>
                    <h4 className="font-extralight text-slate-300 text-sm truncate">
                      {request.subject || "N/A"}
                    </h4>
                    {/* <p className="text-sm text-indigo-400 truncate">
                      {"@"}
                      {request.user.split(".")[0]}{" "}
                    </p> */}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="bg-slate-600/80 text-slate-200 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      {request.branch}
                    </span>
                    <span className="bg-slate-600/80 text-slate-200 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      {parseInt(request.semester) === 1
                        ? "C Cycle"
                        : parseInt(request.semester) === 2
                        ? "P Cycle"
                        : `Sem ${request.semester}`}
                    </span>
                  </div>
                </div>
              </div>
              {/* Request Items */}
              <div className="p-4 space-y-3 flex-grow overflow-y-auto max-h-48">
                {request.documents.map((item, itemIndex) => {
                  if (
                    !item.files ||
                    !item.files.some((file) =>
                      ["reviewing", "approved"].includes(file.status)
                    )
                  ) {
                    return (
                      <div
                        key={item._id || item.name || itemIndex}
                        className="flex items-center justify-between p-2.5 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                              item.type === "Notes"
                                ? "bg-blue-500"
                                : item.type === "QP"
                                ? "bg-green-500"
                                : item.type === "Textbook"
                                ? "bg-purple-500"
                                : "bg-amber-500"
                            }`}
                          ></div>
                          <p
                            className="text-sm text-slate-200 truncate group-hover:text-white transition-colors"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
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
                    );
                  }
                  return null;
                })}
              </div>
              {/* /* Request Footer */}
              <div className="p-4 border-t border-slate-700 flex items-center justify-between bg-slate-800/50 min-h-[80px]">
                <div className="mr-3 flex flex-col gap-2 min-w-0 flex-1">
                  <p
                    className="text-sm text-indigo-400 truncate max-w-[120px] sm:max-w-[180px]"
                    title={request.user}
                  >
                    {"@"}
                    {request.user.split(".")[0]}{" "}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FiClock className="text-slate-500 flex-shrink-0" />
                    <span className="truncate">
                      Posted {new Date(request.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleViewRequest(request)}
                    className="p-2 sm:p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 flex items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 justify-center"
                    title="View Request"
                    aria-label="View Request"
                  >
                    <FiEye className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">view</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      <AnimatePresence>
        {filteredRequests.length === 0 && !isLoadingRequests && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-700"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <FiFilter className="text-3xl text-slate-500" />
            </motion.div>
            <h3 className="text-xl font-medium text-slate-200 mb-2">
              {hasActiveFilters
                ? "No matching requests found"
                : "No requests found"}
            </h3>
            <p className="text-slate-400 max-w-md mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms to find more requests"
                : "Be the first to create a resource request"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Request Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddRequest
            modalVariants={modalVariants}
            setIsAddModalOpen={setIsAddModalOpen}
            handleAddRequest={handleAddRequest}
            newRequest={newRequest}
            setNewRequest={setNewRequest}
            addNewItem={addNewItem}
            updateItem={updateItem}
            removeItem={removeItem}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* View Request Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedRequest && (
          <ViewRequestModal
            modalVariants={modalVariants}
            setIsViewModalOpen={setIsViewModalOpen}
            selectedRequest={selectedRequest}
            setActiveUpload={setActiveUpload}
          />
        )}

        {/* File Upload Modal */}
        <AnimatePresence>
          {activeUpload !== null && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-slate-800 rounded-lg shadow-xl border border-slate-600 w-full max-w-md mx-4"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Upload File
                    </h4>
                    <p className="text-slate-400 text-sm mb-1">
                      {selectedRequest.documents[activeUpload]?.name}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Select one file to contribute
                    </p>
                  </div>

                  <div className="mb-6">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                        selectedFiles[activeUpload]
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="file"
                        id={`file-upload-${activeUpload}`}
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, activeUpload)}
                        accept=".pdf,.doc,.docx,.txt,.pptx,.ppt"
                        disabled={
                          isUploading || uploadProgress[activeUpload] > 0
                        }
                      />
                      <label
                        htmlFor={`file-upload-${activeUpload}`}
                        className={`cursor-pointer block ${
                          uploadProgress[activeUpload] > 0
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        <FiUpload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <div className="text-slate-300 mb-2">
                          {selectedFiles[activeUpload] ? (
                            <div>
                              <span className="text-indigo-400 font-medium block">
                                {selectedFiles[activeUpload].name}
                              </span>
                              <span className="text-slate-500 text-xs">
                                {(
                                  selectedFiles[activeUpload].size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="text-white font-medium">
                                Click to upload
                              </span>{" "}
                              <span className="hidden sm:inline">
                                or drag and drop
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs">
                          PDF, DOC, TXT, or Image files (Max 10MB)
                        </p>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress[activeUpload] > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Uploading...</span>
                          <span className="text-indigo-400">
                            {uploadProgress[activeUpload]}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${uploadProgress[activeUpload]}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancelUpload(activeUpload)}
                      disabled={
                        isUploading ||
                        (uploadProgress[activeUpload] > 0 &&
                          uploadProgress[activeUpload] < 100)
                      }
                      className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpload(activeUpload)}
                      disabled={
                        !selectedFiles[activeUpload] ||
                        isUploading ||
                        (uploadProgress[activeUpload] > 0 &&
                          uploadProgress[activeUpload] < 100)
                      }
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : uploadProgress[activeUpload] === 100 ? (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Complete
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-slate-800 rounded-lg shadow-xl border border-slate-600 w-full max-w-sm mx-4"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiX className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cancel Upload?
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Are you sure you want to cancel? Your selected file will
                      be lost.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      Keep File
                    </button>
                    <button
                      onClick={confirmCancel}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default Requests;
