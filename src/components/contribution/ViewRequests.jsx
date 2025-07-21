import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Eye,
  Check,
  X,
  Clock,
  BookOpenText,
  Calendar,
  Book,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Info,
  User,
} from "lucide-react";
import {
  FiPlus,
  FiX,
  FiTag,
  FiCalendar,
  FiBook,
  FiFileText,
  FiUpload,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import axios from "axios";
import WaveLoader from "../../components/Loading";
import FileViewer from "../FileViewer";
import AddRequest from "./AddRequest";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const useOptimisticUpdate = (requests, setRequests) => {
  const updateRequestOptimistically = useCallback(
    (requestId, documentId, fileId, action, comment) => {
      const updatedRequests = structuredClone(requests); // Deep clone for immutability
      const targetFile = updatedRequests
        .find((req) => req._id === requestId)
        ?.documents.find((doc) => doc._id === documentId)
        ?.files.find((file) => file.fileId === fileId);

      if (targetFile) {
        targetFile.status = action === "approved" ? "reviewing" : action;
        if (comment && action === "rejected") {
          targetFile.rejectionComment = comment;
        }

        // Update other files in the same document if one is approved
        if (
          action === "approved" &&
          updatedRequests
            .find((req) => req._id === requestId)
            ?.documents.find((doc) => doc._id === documentId)?.files.length > 1
        ) {
          updatedRequests
            .find((req) => req._id === requestId)
            ?.documents.find((doc) => doc._id === documentId)
            ?.files.filter((file) => file.fileId !== fileId)
            .forEach((file) => {
              file.status = "rejected";
              file.rejectionComment = "Not satisfied requirement";
            });
        }

        // Update request status based on all documents
        const allDocuments = updatedRequests.find(
          (req) => req._id === requestId
        )?.documents;
        const allFilesAccepted = allDocuments.every((doc) =>
          doc.files.some(
            (file) => file.status === "approved" || file.status === "reviewing"
          )
        );
        const allFilesReviewing = allDocuments.every((doc) =>
          doc.files.some((file) => file.status === "reviewing")
        );

        if (allFilesAccepted) {
          updatedRequests.find((req) => req._id === requestId).status =
            "completed";
        } else if (allFilesReviewing) {
          updatedRequests.find((req) => req._id === requestId).status =
            "reviewing";
        }
      }

      return updatedRequests;
    },
    [requests]
  );
  const revertOptimisticUpdate = useCallback(
    (originalRequests) => {
      setRequests([...originalRequests]);
    },
    [setRequests]
  );

  return { updateRequestOptimistically, revertOptimisticUpdate };
};

const handleApiError = (error, action) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 404) {
    return "Resource not found. Please refresh the page.";
  }

  if (error.response?.status === 400) {
    return "Invalid request. Please check your input.";
  }

  if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  }

  if (error.code === "NETWORK_ERROR") {
    return "Network error. Please check your connection.";
  }

  return `Failed to ${action} file. Please try again.`;
};

const validatePreviewAction = (previewAction, previewFile) => {
  if (!previewAction || !previewFile) {
    console.warn("Missing preview action or file");
    return false;
  }

  const { type, requestId, documentId, fileId } = previewAction;

  if (!["approved", "rejected", "reviewing"].includes(type)) {
    console.error("Invalid action type:", type);
    return false;
  }

  if (!requestId || typeof requestId !== "string") {
    console.error("Invalid request ID:", requestId);
    return false;
  }

  if (!documentId || typeof documentId !== "string") {
    console.error("Invalid document ID:", documentId);
    return false;
  }

  if (!fileId || typeof fileId !== "string") {
    console.error("Invalid file ID:", fileId);
    return false;
  }

  return true;
};

const validateRequestStructure = (requests, requestId, documentId, fileId) => {
  const request = requests.find((req) => req._id === requestId);
  if (!request) {
    console.error("Request not found with ID:", requestId);
    return false;
  }

  const document = request.documents.find((doc) => doc._id === documentId);
  if (!document) {
    console.error("Document not found with ID:", documentId);
    return false;
  }

  const file = document.files.find((file) => file.fileId === fileId);

  if (!file) {
    console.error("File not found with ID:", fileId);
    return false;
  }

  return true;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const RequestActionHandler = ({
  requests,
  setRequests,
  previewAction,
  previewFile,
  rejectComment,
  setRejectComment,
  setActiveRejection,
  setShowPreviewModal,
  setPreviewFile,
  setPreviewAction,
  token, // <-- accept token as parameter
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { updateRequestOptimistically, revertOptimisticUpdate } =
    useOptimisticUpdate(requests, setRequests);

  // Main enhanced handler function
  const handleActionAfterPreview = useCallback(async () => {
    // Early validation
    if (!validatePreviewAction(previewAction, previewFile)) {
      toast.error("Invalid action or file data");
      return;
    }

    const { type: action, requestId, documentId, fileId } = previewAction;

    // Validate request structure
    if (!validateRequestStructure(requests, requestId, documentId, fileId)) {
      toast.error("Invalid request structure. Please refresh the page.");
      return;
    }

    // Validate rejection comment if needed
    if (action === "rejected" && !rejectComment?.trim()) {
      toast.error("Please provide a rejection comment");
      return;
    }

    setIsLoading(true);

    // Store original state for potential rollback
    const originalRequests = [...requests];

    try {
      // Optimistic update
      const optimisticRequests = updateRequestOptimistically(
        requestId,
        documentId,
        fileId,
        action,
        rejectComment
      );
      setRequests(optimisticRequests);

      // Prepare API request
      const request = requests.find((req) => req._id === requestId);
      const document = request.documents.find((doc) => doc._id === documentId);

      const payload = {
        requestId: request._id,
        documentId: document._id,
        fileId: fileId,
        action,
        comment: action === "rejected" ? rejectComment.trim() : undefined,
      };

      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/requests/action`,
        payload,
        {
          signal: controller.signal,
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.data.success) {
        // Update with server response if available
        if (response.data.data) {
          const serverUpdatedRequests = [...optimisticRequests];
          const targetFile = serverUpdatedRequests
            .find((req) => req._id === requestId)
            ?.documents.find((doc) => doc._id === documentId)
            ?.files.find((file) => file.fileId === fileId);

          if (targetFile) {
            targetFile.status = response.data.data.fileStatus;
          }

          serverUpdatedRequests.find((req) => req._id === requestId).status =
            response.data.data.requestStatus;
          setRequests(serverUpdatedRequests);
        }

        // Success feedback
        const actionText = action === "approved" ? "approved" : "rejected";
        toast.success(`File ${actionText} successfully`);
      } else {
        // Revert optimistic update and show error
        revertOptimisticUpdate(originalRequests);
        throw new Error(response.data.message || "Unknown server error");
      }
    } catch (error) {
      // Revert optimistic update
      revertOptimisticUpdate(originalRequests);

      // Handle different error types
      const errorMessage = handleApiError(error, action);
      console.error("Error performing action:", error);
      toast.error(errorMessage);
    } finally {
      // Cleanup
      setIsLoading(false);
      setRejectComment("");
      setActiveRejection(null);
      setShowPreviewModal(false);
      setPreviewFile(null);
      setPreviewAction(null);
    }
  }, [
    previewAction,
    previewFile,
    requests,
    rejectComment,
    updateRequestOptimistically,
    revertOptimisticUpdate,
    setRequests,
    setRejectComment,
    setActiveRejection,
    setShowPreviewModal,
    setPreviewFile,
    setPreviewAction,
    token, // <-- pass token here
  ]);

  // Debounced version for rapid clicks
  const debouncedHandleActionAfterPreview = useMemo(
    () => debounce(handleActionAfterPreview, 300),
    [handleActionAfterPreview]
  );

  return {
    handleActionAfterPreview,
    debouncedHandleActionAfterPreview,
    isLoading,
  };
};

const ViewRequests = () => {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
  } = useAuth0();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerFile, setViewerFile] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      if (authLoading || !isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const t = await getAccessTokenSilently();
        setToken(t);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/requests/all`,
          {
            params: { email: user?.email },
            headers: {
              Authorization: `Bearer ${t}`,
            },
          }
        );

        if (response.data.success) {
          setRequests(response.data.requests);
        } else {
          throw new Error(response.data.message || "Failed to fetch requests");
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load requests. Please try again later."
        );
        toast.error("Error loading requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.email, isAuthenticated, authLoading, getAccessTokenSilently]);

  useEffect(() => {
    const fetchToken = async () => {
      if (!authLoading && isAuthenticated) {
        const t = await getAccessTokenSilently();
        setToken(t);
      }
    };
    fetchToken();
  }, [authLoading, isAuthenticated, getAccessTokenSilently]);

  const [rejectComment, setRejectComment] = useState("");
  const [activeRejection, setActiveRejection] = useState(null);
  const [expandedRequests, setExpandedRequests] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    branch: "",
    semester: "",
    subject: "",
    subjectCode: "",
    items: [{ name: "", type: "Notes", description: "" }],
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewAction, setPreviewAction] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5; // You can adjust this number

  // Track expanded files for each document (by requestId and documentIndex)
  const [expandedFiles, setExpandedFiles] = useState({});

  // Sort requests by postedAt (latest first)
  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
    );
  }, [requests]);

  // Pagination logic
  const totalPages = Math.ceil(sortedRequests.length / requestsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIdx = (currentPage - 1) * requestsPerPage;
    return sortedRequests.slice(startIdx, startIdx + requestsPerPage);
  }, [sortedRequests, currentPage, requestsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Toggle expanded files for a document
  const toggleFilesExpansion = (requestId, documentId) => {
    setExpandedFiles((prev) => {
      const key = `${requestId}-${documentId}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const {
    handleActionAfterPreview,
    debouncedHandleActionAfterPreview,
    isLoading: isItLoading,
  } = RequestActionHandler({
    requests,
    setRequests,
    previewAction,
    previewFile,
    rejectComment,
    setRejectComment,
    setActiveRejection,
    setShowPreviewModal,
    setPreviewFile,
    setPreviewAction,
    token, // <-- pass token here
  });

  const handleAccept = () => {
    // Use debounced version to prevent rapid clicks
    debouncedHandleActionAfterPreview();
  };

  const handleReject = () => {
    if (!rejectComment.trim()) {
      toast.error("Please provide a rejection comment");
      return;
    }
    debouncedHandleActionAfterPreview();
  };

  const toggleRequestExpansion = (requestId) => {
    setExpandedRequests((prev) => ({
      [requestId]: !prev[requestId],
    }));
  };

  const handleDeleteRequest = async (requestId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action");
      return;
    }

    const request = requests.find((r) => r._id === requestId);
    if (!request) {
      toast.error("Request not found");
      return;
    }

    // Check if there are any contributions
    const hasContributions = request.documents.some(
      (doc) => doc.files.length > 0
    );
    if (hasContributions) {
      toast.error("Cannot delete request with existing contributions");
      setDeleteRequestId(null);
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}`,
        {
          data: {
            user: {
              email: user.email,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );
        toast.success("Request deleted successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error(err.response?.data?.message || "Failed to delete request");
    }
    setDeleteRequestId(null);
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action");
      return;
    }

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
        setRequests((prev) => [response.data.request, ...prev]);
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
      toast.error(err.response?.data?.message || "Failed to create request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId, documentId, fileId, action) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action");
      return;
    }

    if (action === "rejected" && !rejectComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const request = requests.find((req) => req._id === requestId);
    const file = request.documents
      .find((doc) => doc._id === documentId)
      .files.find((f) => f.fileId === fileId);

    setPreviewFile(file);
    setPreviewAction({
      type: action,
      requestId,
      documentId,
      fileId,
    });
    setShowPreviewModal(true);
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

  const startRejection = (requestId, documentId, fileId) => {
    setActiveRejection(`${requestId}-${documentId}-${fileId}`);
  };

  const cancelRejection = () => {
    setActiveRejection(null);
    setRejectComment("");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Completed",
      },
      reviewing: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        label: "Reviewing",
      },
      pending: {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        label: "Pending",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div
        className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} `}
      >
        {config.label}
      </div>
    );
  };

  const getFileTypeBadge = (type) => {
    const typeConfig = {
      Notes: { bg: "bg-blue-500/20", text: "text-blue-400" },
      Textbook: { bg: "bg-purple-500/20", text: "text-purple-400" },
      "Lab Manual": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    };

    const config = typeConfig[type] || typeConfig.Notes;

    return (
      <span
        className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium ${config.bg} ${config.text} `}
      >
        {type}
      </span>
    );
  };

  const getFileStatusIndicator = (status) => {
    const statusConfig = {
      approved: "bg-green-500",
      rejected: "bg-red-500",
      reviewing: "bg-blue-500",
      pending: "bg-amber-500",
    };

    return `h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full  flex-shrink-0 ${
      statusConfig[status] || statusConfig.pending
    }`;
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-red-500">
          <div className="text-xl font-semibold">Error loading requests</div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="w-full min-h-full pb-8 bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 max-w-full overflow-x-hidden">
          <div className="w-full mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 max-w-full">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <h1 className="font-bold text-lg xs:text-xl sm:text-2xl lg:text-3xl text-white flex items-center gap-1 xs:gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Book className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                    <span className="truncate">Your Resource Requests</span>
                  </h1>
                  <p className="text-xs xs:text-sm sm:text-base text-slate-400">
                    Manage and review your resource contributions
                  </p>
                </div>
                {/* Pagination Controls - Top Right, Responsive */}
                {totalPages > 1 && (
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-end gap-1 xs:gap-2 mt-2 xs:mt-0 w-full xs:w-auto">
                    <div className="flex flex-wrap justify-end gap-1 xs:gap-1.5">
                      <button
                        className="px-2 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50 min-w-[60px]"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`px-2 py-1 text-xs rounded min-w-[32px] ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="px-2 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50 min-w-[60px]"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-1 xs:gap-2">
                <button
                  onClick={() => {
                    setExpandedRequests({});
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 xs:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 xs:px-4 xs:py-2.5 rounded-lg font-medium text-xs xs:text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <FiPlus className="text-base xs:text-lg" />
                  <span>Add Request</span>
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 w-full max-w-full">
              {paginatedRequests.map((request, requestIndex) => (
                <div
                  key={request._id || requestIndex}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 text-xs xs:text-sm sm:text-base w-full max-w-full"
                >
                  {/* Request Header */}
                  <div
                    className="p-3 sm:p-4 lg:p-6 cursor-pointer group w-full max-w-full"
                    onClick={() => toggleRequestExpansion(request._id)}
                  >
                    <div className="flex justify-between items-start gap-3 flex-wrap w-full max-w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-white group-hover:text-blue-400 transition-colors truncate">
                              {request.subjectCode}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                {request.branch}
                              </span>
                              <span className="bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                {parseInt(request.semester) === 1
                                  ? "C Cycle"
                                  : parseInt(request.semester) === 2
                                  ? "P Cycle"
                                  : `Sem ${request.semester}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="text-slate-500 w-3 h-3 sm:w-4 sm:h-4" />
                            Posted{" "}
                            {new Date(request.postedAt).toLocaleDateString()}
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-slate-500">Documents:</span>
                            {request.documents.length}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        {getStatusBadge(request.status)}
                        <button
                          onClick={(e) => {
                            setExpandedRequests({});
                            e.stopPropagation();
                            setDeleteRequestId(request._id);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                          title="Delete request"
                        >
                          <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors p-0.5 sm:p-1">
                          {expandedRequests[request._id] ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {/* Expanded Content  */}
                    {expandedRequests[request._id] && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-700/50 relative overflow-x-auto w-full max-w-full"
                      >
                        <div className="p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4 w-full max-w-full">
                          <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                            {request.documents.map(
                              (document, documentIndex) => {
                                const filesKey = `${request._id}-${document._id}`;
                                const filesExpanded = expandedFiles[filesKey];
                                const showExpand =
                                  document.files && document.files.length > 1;
                                // Prefer showing: approved > pending > reviewing > rejected
                                let sortedFiles = document.files
                                  ? [...document.files]
                                  : [];
                                sortedFiles.sort((a, b) => {
                                  const statusOrder = {
                                    approved: 0,
                                    pending: 1,
                                    reviewing: 2,
                                    rejected: 3,
                                  };
                                  return (
                                    (statusOrder[a.status] ?? 99) -
                                    (statusOrder[b.status] ?? 99)
                                  );
                                });
                                const filesToShow =
                                  showExpand && !filesExpanded
                                    ? [sortedFiles[0]]
                                    : sortedFiles;
                                return (
                                  <div
                                    key={`${document._id}-${documentIndex}`}
                                    className="bg-slate-900/50 rounded-lg sm:rounded-xl border border-slate-700/50 p-2 xs:p-3 sm:p-4 lg:p-5 transition-all duration-200 hover:border-slate-600/50 relative overflow-x-auto w-full max-w-full"
                                  >
                                    {/* Document Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                                      {document.files?.length > 1 &&
                                        !document.files.some(
                                          (ele) =>
                                            ele.status === "reviewing" ||
                                            ele.status === "approved"
                                        ) &&
                                        request.status === "pending" && (
                                          <span className="absolute top-0 right-0 translate-x-0 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30 z-10">
                                            {" "}
                                            Accept only one document
                                          </span>
                                        )}
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                          <BookOpenText className="text-blue-400 w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-medium text-sm sm:text-base text-white truncate">
                                            {document.name || "N/A"}
                                          </p>
                                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400">
                                            <span className="flex gap-1 items-center justify-center">
                                              <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                              <span className="text-slate-500">
                                                {(document?.description
                                                  ?.length > 25
                                                  ? document?.description?.slice(
                                                      0,
                                                      23
                                                    ) + "..."
                                                  : document.description) ||
                                                  "No description provided"}
                                              </span>
                                            </span>
                                            <span className="flex gap-1 items-center justify-center">
                                              <span className="text-slate-500 flex justify-center items-center gap-1">
                                                {document.files?.length == 0 ||
                                                  (document.files?.every(
                                                    (ele) =>
                                                      ele.status === "rejected"
                                                  ) && (
                                                    <>
                                                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                      <span>
                                                        Awaiting contribution
                                                      </span>
                                                    </>
                                                  ))}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-800/50 rounded-full text-xs font-medium text-slate-300 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                                        {document.type || "N/A"}
                                      </div>
                                    </div>
                                    {/* Files */}
                                    <div className="space-y-2 sm:space-y-3 w-full max-w-full">
                                      {filesToShow &&
                                        filesToShow.map((file, fileIndex) => (
                                          <div
                                            key={`${document._id}-${fileIndex}-${file.fileId}`}
                                            className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-2 xs:p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 w-full max-w-full break-words"
                                          >
                                            <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-full">
                                              {/* File Info */}
                                              <div className="flex items-start gap-2 sm:gap-3 flex-wrap w-full max-w-full">
                                                <div
                                                  className={getFileStatusIndicator(
                                                    file.status
                                                  )}
                                                />
                                                <div className="flex-1 min-w-0 w-full max-w-full">
                                                  <h4 className="font-medium text-xs xs:text-sm sm:text-base text-white break-words break-all w-full max-w-full whitespace-normal">
                                                    {file.fileName}
                                                  </h4>
                                                  <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-400">
                                                    <p className="text-xs sm:text-xs text-slate-400 truncate mt-0.5 sm:mt-1 flex items-center">
                                                      <Clock className="inline w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                                      {new Date(
                                                        file.contributedAt
                                                      ).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5 sm:mt-1">
                                                      <User className="inline w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                                      {"@"}
                                                      {file.contributedBy.split(
                                                        "."
                                                      )[0] ||
                                                        "Anonymous Contributor"}
                                                    </p>
                                                  </span>

                                                  {file.rejectionComment && (
                                                    <div className="mt-2 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                                                      <p className="text-xs sm:text-sm text-red-400">
                                                        <span className="font-medium">
                                                          Rejection reason:
                                                        </span>{" "}
                                                        {file.rejectionComment}
                                                      </p>
                                                    </div>
                                                  )}

                                                  {/* Status Badge */}
                                                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 mt-2">
                                                    {file.status ===
                                                    "pending" ? (
                                                      <>
                                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="text-slate-500">
                                                          Waiting for your
                                                          approval
                                                        </span>
                                                      </>
                                                    ) : file.status ===
                                                      "reviewing" ? (
                                                      <>
                                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="text-slate-500">
                                                          Waiting for admin
                                                          approval
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="text-slate-500">
                                                          {"Contribution "}
                                                          {file.status}
                                                        </span>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* File Actions Row */}
                                              <div className="flex items-center justify-between gap-2 sm:gap-3">
                                                {getFileTypeBadge(
                                                  document.type
                                                )}
                                                <div className="flex items-center gap-1 sm:gap-4">
                                                  <button
                                                    className="p-1.5 sm:p-2 rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 border border-slate-600/50"
                                                    title="View file"
                                                    onClick={() => {
                                                      setViewerFile(
                                                        file?.webViewLink
                                                      );
                                                    }}
                                                  >
                                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                  </button>
                                                  <button
                                                    className="p-1.5 sm:p-2 rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 border border-slate-600/50"
                                                    title="Download file"
                                                    onClick={() =>
                                                      window.open(
                                                        file.webContentLink,
                                                        "_blank"
                                                      )
                                                    }
                                                  >
                                                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Action Buttons */}
                                              {file.status === "pending" && (
                                                <div className="pt-2 sm:pt-3 border-t border-slate-700/50">
                                                  {activeRejection ===
                                                  `${request._id}-${document._id}-${file.fileId}` ? (
                                                    <div className="space-y-2 sm:space-y-3">
                                                      <textarea
                                                        value={rejectComment}
                                                        onChange={(e) =>
                                                          setRejectComment(
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="Please provide a reason for rejection..."
                                                        className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                        rows={2}
                                                        required
                                                      />
                                                      <div className="flex justify-end gap-1.5 sm:gap-2">
                                                        <button
                                                          onClick={
                                                            cancelRejection
                                                          }
                                                          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 border border-slate-600"
                                                          disabled={isLoading}
                                                        >
                                                          Cancel
                                                        </button>
                                                        <button
                                                          onClick={() =>
                                                            handleAction(
                                                              request._id,
                                                              document._id,
                                                              file.fileId,
                                                              "rejected"
                                                            )
                                                          }
                                                          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 flex items-center gap-1 sm:gap-2 transition-all duration-200 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                          disabled={
                                                            !rejectComment.trim() ||
                                                            isLoading
                                                          }
                                                        >
                                                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                          {isLoading
                                                            ? "Rejecting..."
                                                            : "Reject"}
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className="flex justify-end gap-1.5 sm:gap-2">
                                                      <button
                                                        onClick={() =>
                                                          handleAction(
                                                            request._id,
                                                            document._id,
                                                            file.fileId,
                                                            "approved"
                                                          )
                                                        }
                                                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 flex items-center gap-1 sm:gap-2 transition-all duration-200 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={isLoading}
                                                      >
                                                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {isLoading
                                                          ? "Accepting..."
                                                          : "Accept"}
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          startRejection(
                                                            request._id,
                                                            document._id,
                                                            file.fileId
                                                          )
                                                        }
                                                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 flex items-center gap-1 sm:gap-2 transition-all duration-200 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={isLoading}
                                                      >
                                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Reject
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {file.status !== "pending" && (
                                                <div className="pt-2 sm:pt-3 border-t border-slate-700/50">
                                                  <div
                                                    className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium ${
                                                      file.status === "approved"
                                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                        : file.status ===
                                                          "reviewing"
                                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                    }`}
                                                  >
                                                    {file.status ===
                                                    "approved" ? (
                                                      <>
                                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                                        Accepted
                                                      </>
                                                    ) : file.status ===
                                                      "reviewing" ? (
                                                      <>
                                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                                        Reviewing
                                                      </>
                                                    ) : (
                                                      <>
                                                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                                        Rejected
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      {showExpand && (
                                        <button
                                          className="mt-2 text-xs text-blue-400 hover:underline focus:outline-none"
                                          onClick={() =>
                                            toggleFilesExpansion(
                                              request._id,
                                              document._id
                                            )
                                          }
                                        >
                                          {filesExpanded
                                            ? `Show less`
                                            : `Show all (${document.files.length}) files`}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {/* Pagination Controls (bottom) - hidden on small screens, visible on md+ for redundancy */}
            {totalPages > 1 && (
              <div className="hidden xs:flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-2 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50 min-w-[60px]"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-2 py-1 text-xs rounded min-w-[32px] ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-white"
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-2 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50 min-w-[60px]"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}

            {/* Empty State */}
            {requests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 sm:mb-6 border border-slate-700">
                  <Book className="text-2xl sm:text-3xl text-slate-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  No requests found
                </h3>
                <p className="text-sm sm:text-base text-slate-400 max-w-md px-4">
                  You haven't made any resource requests yet. When you do,
                  they'll appear here for you to manage.
                </p>
              </div>
            )}
          </div>
          {deleteRequestId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
              <div className="bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <FiAlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Delete Request
                      </h3>
                      <p className="text-sm text-slate-400">
                        Are you sure you want to delete this request? This
                        action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteRequestId(null)}
                      className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(deleteRequestId)}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
      {/* File Preview Modal */}
      <AnimatePresence>
        {viewerFile && (
          <FileViewer url={viewerFile} onClose={() => setViewerFile(null)} />
        )}

        {showPreviewModal && previewFile && (
          <motion.div
            className="fixed inset-0 mt-10 md:mt-1 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 w-full max-w-4xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Preview File
                    </h3>
                    <p className="text-sm text-slate-400">
                      Please review the file before{" "}
                      {previewAction?.type === "approved"
                        ? "accepting"
                        : "rejecting"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewFile(null);
                      setPreviewAction(null);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    disabled={isItLoading}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
                  <iframe
                    src={previewFile.webViewLink}
                    className="w-full h-[60vh] rounded-lg"
                    title="File Preview"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewFile(null);
                      setPreviewAction(null);
                    }}
                    className="px-4 py-2.5 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                    disabled={isItLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (previewAction?.type === "approved") {
                        handleAccept();
                      } else {
                        handleReject();
                      }
                    }}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                ${
                  previewAction?.type === "approved"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                    disabled={isItLoading}
                  >
                    {isItLoading ? (
                      previewAction?.type === "approved" ? (
                        <>
                          <Check className="w-4 h-4" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Rejecting...
                        </>
                      )
                    ) : previewAction?.type === "approved" ? (
                      <>
                        <Check className="w-4 h-4" />
                        Accept File
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Reject File
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ViewRequests;
