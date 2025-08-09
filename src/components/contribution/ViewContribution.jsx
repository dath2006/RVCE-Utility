import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Check,
  Calendar,
  AlertTriangle,
  Eye,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "react-toastify";
import FileViewer from "../FileViewer";
import WaveLoader from "../Loading";
import useBottomBarVisibility from "../../hooks/useBottomBarVisibility";

const ViewContribution = ({ isOpen = true, userRank }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [overallStats, setOverallStats] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [viewerFile, setViewerFile] = useState(null);

  // Use bottom bar visibility hook for file viewer
  useBottomBarVisibility(!!viewerFile, "file-viewer-contribution");

  // Pagination settings
  const docsPerPage = 7;
  const totalPages = Math.ceil(data.length / docsPerPage);

  // Get current page's documents
  const getCurrentPageDocs = () => {
    const startIndex = (currentPage - 1) * docsPerPage;
    const endIndex = startIndex + docsPerPage;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    getData();
  }, [isLoading, isAuthenticated]);

  const toggleSubject = (subjectId) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const getData = async () => {
    if (!isLoading && isAuthenticated) {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/getData?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          setData(res.data.resources);
          calculateStats(res.data.resources);
        } else {
          toast.error("Error fetching Stats");
        } // Mock data
        // setData([
        //   {
        //     file: "Linear Algebra Solutions.pdf",
        //     uploadedAt: "2023-10-01T12:00:00Z",
        //     subject: "MTH101",
        //     approved: "approved",
        //   },
        //   {
        //     file: "Physics Lab Report.docx",
        //     uploadedAt: "2023-10-02T14:30:00Z",
        //     subject: "PHY102",
        //     approved: "pending",
        //   },
        //   {
        //     file: "Chemistry Assignment.pdf",
        //     uploadedAt: "2023-10-03T09:15:00Z",
        //     subject: "CHE103",
        //     approved: "rejected",
        //   },
        // ]);

        //     {
        //   "subject": "XIX123W",
        //   "id": "1mmotVpPbFO7F0zeeZpNDZvErJJWK0yqv",
        //   "name": "Exp-7 Flame Photometry.pdf",
        //   "webViewLink": "https://drive.google.com/file/d/1mmotVpPbFO7F0zeeZpNDZvErJJWK0yqv/view?usp=drivesdk",
        //   "webContentLink": "https://drive.google.com/uc?id=1mmotVpPbFO7F0zeeZpNDZvErJJWK0yqv&export=download",
        //   "description": "Document Type: Question Paper, Subject: XIX123W, Semester: 2, Branch: Civil, Uploaded by: hackingman2006@gmail.com",
        //   "docType": "Question Paper",
        //   "contributedTo": null,
        //   "uploadSessionId": "aa3c62b8-789f-435b-bbb7-1f2a86c1d8d1",
        //   "approved": "pending",
        //   "_id": {
        //     "$oid": "684338ba63375f3e7e329c1e"
        //   },
        //   "uploadedAt": {
        //     "$date": "2025-06-06T18:51:38.092Z"
        //   }
        // }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-emerald-400" />;
      case "rejected":
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-amber-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`;
      case "rejected":
        return `${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`;
      default:
        return `${baseClasses} bg-amber-500/20 text-amber-300 border border-amber-500/30`;
    }
  };

  const getWarningBadge = (type, count, text) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium";
    switch (type) {
      case "warning":
        return `${baseClasses} bg-amber-500/20 text-amber-300 border border-amber-500/30`;
      case "error":
        return `${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`;
      case "success":
        return `${baseClasses} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`;
      default:
        return `${baseClasses} bg-slate-500/20 text-slate-300 border border-slate-500/30`;
    }
  };

  const calculateSubjectStats = (documents) => {
    return {
      approved: documents.filter((doc) => doc.status === "approved").length,
      rejected: documents.filter((doc) => doc.status === "rejected").length,
      pending: documents.filter(
        (doc) => doc.status === "pending" || doc.status === "reviewing"
      ).length,
      total: documents.length,
    };
  };

  const calculateStats = (docs) => {
    const overallStats = docs.reduce(
      (acc, doc) => {
        const stats = calculateSubjectStats(doc.documents);
        acc.approved += stats.approved;
        acc.rejected += stats.rejected;
        acc.pending += stats.pending;
        acc.total += stats.total;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0, total: 0 }
    );
    setOverallStats(overallStats);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <WaveLoader
              size="7em"
              primaryColor="hsl(220,90%,50%)"
              secondaryColor="hsl(300,90%,50%)"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    data && (
      <div className="min-h-full pb-16 bg-slate-900 p-2 sm:p-4 lg:p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 p-3 sm:p-4 md:p-6 w-full"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
              Contribution Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Track your document contributions and approval status
            </p>
          </motion.div>

          {/* Overall Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-lg sm:rounded-xl border border-blue-500/30 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Overall Statistics
                </h2>
                <div className="flex items-center gap-2">
                  {userRank ? (
                    <>
                      <div className="text-3xl font-bold text-blue-400">
                        #{userRank}
                      </div>
                      <div className="text-slate-300 text-sm">
                        {userRank <= 3 && "Top "} Contributor
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-300 text-sm">
                      {" "}
                      Contribute to start seeing your rank
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-2 sm:p-3 md:p-4 transition-all duration-200 hover:border-slate-600/50 text-center"
              >
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Check size={16} sm={20} className="text-emerald-400" />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                  {overallStats.approved}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
                  Accepted
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-2 sm:p-3 md:p-4 transition-all duration-200 hover:border-slate-600/50 text-center"
              >
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <X size={16} sm={20} className="text-red-400" />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                  {overallStats.rejected}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
                  Rejected
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock size={20} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {overallStats.pending}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  Pending
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 sm:p-4 transition-all duration-200 hover:border-slate-600/50 text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {overallStats.total}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  Total
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Subjects List */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {data.length > 7 && (
              <motion.div
                className="p-3 sm:p-4 flex flex-col gap-3 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/40"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Mobile-First Layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Latest Upload - Mobile Stacked */}
                  <motion.div
                    className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Clock size={14} className="text-blue-400" />
                      </motion.div>
                      <span className="text-slate-400">Latest:</span>
                    </div>
                    <span className="text-blue-300 font-medium text-xs sm:text-sm">
                      {data.length > 0
                        ? new Date(
                            Math.max(
                              ...data.map(
                                (doc) => new Date(doc.documents[0].uploadedAt)
                              )
                            )
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "None"}
                    </span>
                  </motion.div>

                  {/* Document Count - Mobile Friendly */}
                  <motion.div
                    className="text-xs sm:text-sm text-slate-300 bg-slate-700/40 px-2.5 py-1 rounded-md border border-slate-600/20"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span className="text-blue-300 font-semibold">
                      {Math.min(currentPage * docsPerPage, data.length)}
                    </span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-blue-300 font-semibold">
                      {data.length}
                    </span>
                  </motion.div>
                </div>

                {/* Compact Pagination Controls */}
                <div className="flex items-center justify-center gap-1.5">
                  {/* Previous Button */}
                  <motion.button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
                      currentPage === 1
                        ? "bg-slate-800/40 text-slate-500 cursor-not-allowed"
                        : "bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white active:bg-slate-500/50"
                    }`}
                    whilehover={currentPage > 1 ? { scale: 1.05 } : {}}
                    whiletap={currentPage > 1 ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>

                  {/* Smart Page Display for Mobile */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];

                      // Mobile: Show fewer pages
                      const isMobile = window.innerWidth < 640;
                      const maxVisible = isMobile ? 3 : 5;

                      if (totalPages <= maxVisible) {
                        // Show all pages if few enough
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <motion.button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-150 min-w-[32px] ${
                                currentPage === i
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                              }`}
                              whilehover={{ scale: 1.05 }}
                              whiletap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 + i * 0.03 }}
                            >
                              {i}
                            </motion.button>
                          );
                        }
                      } else {
                        // Smart pagination for many pages
                        const showFirst = currentPage > 2;
                        const showLast = currentPage < totalPages - 1;

                        if (showFirst) {
                          pages.push(
                            <motion.button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className="px-2.5 py-1.5 text-xs sm:text-sm rounded-md bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-150 min-w-[32px]"
                              whilehover={{ scale: 1.05 }}
                              whiletap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 }}
                            >
                              1
                            </motion.button>
                          );

                          if (currentPage > 3) {
                            pages.push(
                              <span
                                key="dots1"
                                className="px-1 text-slate-500 text-xs"
                              >
                                ...
                              </span>
                            );
                          }
                        }

                        // Current page with neighbors
                        const start = Math.max(1, currentPage - 1);
                        const end = Math.min(totalPages, currentPage + 1);

                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <motion.button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-150 min-w-[32px] ${
                                currentPage === i
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                              }`}
                              whilehover={{ scale: 1.05 }}
                              whiletap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 + (i - start) * 0.03 }}
                            >
                              <motion.span
                                animate={
                                  currentPage === i
                                    ? { opacity: [1, 0.7, 1] }
                                    : {}
                                }
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {i}
                              </motion.span>
                            </motion.button>
                          );
                        }

                        if (showLast) {
                          if (currentPage < totalPages - 2) {
                            pages.push(
                              <span
                                key="dots2"
                                className="px-1 text-slate-500 text-xs"
                              >
                                ...
                              </span>
                            );
                          }

                          pages.push(
                            <motion.button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-2.5 py-1.5 text-xs sm:text-sm rounded-md bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-150 min-w-[32px]"
                              whilehover={{ scale: 1.05 }}
                              whiletap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 }}
                            >
                              {totalPages}
                            </motion.button>
                          );
                        }
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
                      currentPage === totalPages
                        ? "bg-slate-800/40 text-slate-500 cursor-not-allowed"
                        : "bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 hover:text-white active:bg-slate-500/50"
                    }`}
                    whilehover={currentPage < totalPages ? { scale: 1.05 } : {}}
                    whiletap={currentPage < totalPages ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>

                {/* Optional: Current Page Indicator for Mobile */}
                {totalPages > 5 && (
                  <motion.div
                    className="text-center text-xs text-slate-400 sm:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Page {currentPage} of {totalPages}
                  </motion.div>
                )}
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {getCurrentPageDocs().map((doc) => {
                const stats = calculateSubjectStats(doc.documents);

                const isExpanded = expandedSubjects.has(doc.documents[0]._id);

                return (
                  <motion.div
                    key={doc.documents[0]._id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    {/* Subject Header */}
                    <div
                      className="p-3 sm:p-4 md:p-6 cursor-pointer border-b border-slate-700/50"
                      onClick={() => toggleSubject(doc.documents[0]._id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 md:gap-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <BookOpen
                              size={16}
                              sm={20}
                              className="text-blue-400"
                            />
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {doc.documents[0].subject ||
                                doc.documents[0].subjectCode}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300">
                            <div className="flex items-center gap-1">
                              <User size={12} sm={14} />
                              <span className="truncate max-w-[100px] sm:max-w-none">
                                {doc?.documents[0]?.contributedTo?.split(
                                  "."
                                )[0] || "open-contribution"}
                              </span>
                            </div>
                            <span className="text-slate-400 text-xs sm:text-sm">
                              {doc.documents[0].branch +
                                " - " +
                                `${
                                  parseInt(doc.documents[0].semester) === 1
                                    ? "C Cycle"
                                    : parseInt(doc.documents[0].semester) === 2
                                    ? "P Cycle"
                                    : `SEM - ${doc.documents[0].semester}`
                                }`}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                          {stats.pending > 0 && (
                            <span
                              className={
                                getWarningBadge("warning") +
                                " text-[10px] sm:text-xs"
                              }
                            >
                              <Clock size={10} sm={12} />
                              {stats.pending} pending
                            </span>
                          )}
                          {stats.rejected > 0 && (
                            <span
                              className={
                                getWarningBadge("error") +
                                " text-[10px] sm:text-xs"
                              }
                            >
                              <AlertTriangle size={10} sm={12} />
                              {stats.rejected} rejected
                            </span>
                          )}
                          {stats.approved > 0 && (
                            <span
                              className={
                                getWarningBadge("success") +
                                " text-[10px] sm:text-xs"
                              }
                            >
                              <Check size={10} sm={12} />
                              {stats.approved} accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subject Details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{
                            height: "auto",
                            transition: {
                              height: {
                                duration: 0.3,
                                ease: "easeOut",
                              },
                            },
                          }}
                          exit={{
                            height: 0,
                            transition: {
                              height: {
                                duration: 0.3,
                                ease: "easeIn",
                              },
                            },
                          }}
                          className="overflow-hidden w-full"
                        >
                          <div className="p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-3 w-full">
                            {doc.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="bg-slate-900/50 rounded-lg sm:rounded-xl border border-slate-700/50 p-2 sm:p-3 md:p-4 transition-all duration-200 hover:border-slate-600/50 w-full"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 w-full">
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <FileText
                                      size={16}
                                      className="text-slate-400 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      <h4 className="text-sm sm:text-base text-white font-medium truncate max-w-[200px] sm:max-w-full">
                                        {doc.fileName}
                                      </h4>
                                      <div className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 truncate">
                                        Uploaded on{" "}
                                        {new Date(
                                          doc.uploadedAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>

                                  {doc.rejectionComment && (
                                    <div className="mt-2 w-full sm:w-auto p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-md break-words">
                                      <p className="text-[10px] sm:text-xs md:text-sm text-red-400">
                                        <span className="font-medium block sm:inline">
                                          Rejection reason:
                                        </span>
                                        <span className="block sm:inline sm:ml-1">
                                          {doc.rejectionComment}
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                                    <span
                                      className={
                                        getStatusBadge(doc.status) +
                                        " text-[10px] sm:text-xs"
                                      }
                                    >
                                      {getStatusIcon(doc.status)}
                                      {doc.status.charAt(0).toUpperCase() +
                                        doc.status.slice(1)}
                                    </span>
                                    <button
                                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                                      onClick={() => {
                                        setViewerFile(doc?.webViewLink) ||
                                          doc.webContentLink;
                                      }}
                                    >
                                      <Eye size={14} sm={16} />
                                      View
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {data.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700 p-6 sm:p-8 md:p-12 text-center">
              <FileText
                size={32}
                sm={48}
                className="text-slate-600 mx-auto mb-3 sm:mb-4"
              />
              <h3 className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">
                No contributions yet
              </h3>
              <p className="text-sm sm:text-base text-slate-400">
                Start contributing documents to see them here.
              </p>
            </div>
          )}
        </div>
        <AnimatePresence>
          {viewerFile && (
            <FileViewer url={viewerFile} onClose={() => setViewerFile(null)} />
          )}
        </AnimatePresence>
      </div>
    )
  );
};

export default ViewContribution;
