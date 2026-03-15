import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Book,
  BookOpenText,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  Info,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import axios from "axios";

import WaveLoader from "../../components/Loading";
import FileViewer from "../FileViewer";
import AddRequest from "./AddRequest";
import ContributionModalPortal from "./ContributionModalPortal";
import useBottomBarVisibility from "../../hooks/useBottomBarVisibility";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

const semesterLabel = (semester) => {
  const value = Number(semester);
  if (value === 1) return "C Cycle";
  if (value === 2) return "P Cycle";
  return `Sem ${semester}`;
};

const requestStatusClass = {
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  reviewing: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
};

const fileStatusClass = {
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  reviewing: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
};

const fileTypeClass = {
  Notes: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  QP: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  Textbook: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600",
  Lab: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  Other: "border-slate-400/40 bg-slate-500/10 text-slate-600",
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
  const [token, setToken] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  const [expandedRequests, setExpandedRequests] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});

  const [viewerFile, setViewerFile] = useState(null);
  const [deleteRequestId, setDeleteRequestId] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    branch: "",
    semester: "",
    subject: "",
    subjectCode: "",
    items: [{ name: "", type: "Notes", description: "" }],
  });

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewAction, setPreviewAction] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useBottomBarVisibility(!!viewerFile, "file-viewer-requests");
  useBottomBarVisibility(!!deleteRequestId, "delete-request-modal");
  useBottomBarVisibility(isAddModalOpen, "add-request-modal");
  useBottomBarVisibility(showPreviewModal, "preview-modal");

  const fetchRequests = useCallback(async () => {
    if (authLoading || !isAuthenticated || !user?.email) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessToken = await getAccessTokenSilently();
      setToken(accessToken);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/requests/all`,
        {
          params: { email: user.email },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.success) {
        setRequests(response.data.requests || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch requests");
      }
    } catch (requestError) {
      console.error("Error fetching requests:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Failed to load your requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, getAccessTokenSilently, isAuthenticated, user?.email]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
  }, [requests]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedRequests.length / requestsPerPage),
  );

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * requestsPerPage;
    return sortedRequests.slice(start, start + requestsPerPage);
  }, [currentPage, sortedRequests]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        const status = request.status || "pending";
        if (status === "completed") acc.completed += 1;
        else if (status === "reviewing") acc.reviewing += 1;
        else acc.pending += 1;
        acc.total += 1;
        return acc;
      },
      { pending: 0, reviewing: 0, completed: 0, total: 0 },
    );
  }, [requests]);

  const toggleRequestExpansion = (requestId) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const toggleFilesExpansion = (requestId, documentId) => {
    const key = `${requestId}-${documentId}`;
    setExpandedFiles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteRequest = async (requestId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action");
      return;
    }

    const targetRequest = requests.find((request) => request._id === requestId);
    if (!targetRequest) {
      toast.error("Request not found");
      return;
    }

    const hasContributions = targetRequest.documents?.some(
      (document) => (document.files || []).length > 0,
    );

    if (hasContributions) {
      toast.error("Cannot delete a request that already has contributions");
      setDeleteRequestId(null);
      return;
    }

    try {
      const accessToken = token || (await getAccessTokenSilently());
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}`,
        {
          data: {
            user: {
              email: user.email,
            },
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId),
      );
      toast.success("Request deleted successfully");
    } catch (deleteError) {
      console.error("Error deleting request:", deleteError);
      toast.error(
        deleteError.response?.data?.message || "Failed to delete request",
      );
    } finally {
      setDeleteRequestId(null);
    }
  };

  const handleAddRequest = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action");
      return;
    }

    try {
      setIsAddingRequest(true);
      const accessToken = token || (await getAccessTokenSilently());
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
            Authorization: `Bearer ${accessToken}`,
          },
        },
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
        throw new Error(response.data.message || "Failed to create request");
      }
    } catch (addError) {
      console.error("Error creating request:", addError);
      toast.error(
        addError.response?.data?.message || "Failed to create request",
      );
    } finally {
      setIsAddingRequest(false);
    }
  };

  const addNewItem = () => {
    setNewRequest((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", type: "Notes", description: "" }],
    }));
  };

  const updateItem = (index, field, value) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeItem = (index) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const openPreview = (type, requestId, documentId, file) => {
    setPreviewAction({
      type,
      requestId,
      documentId,
      fileId: file.fileId,
    });
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewAction(null);
    setRejectComment("");
  };

  const submitPreviewAction = async () => {
    if (!previewAction || !previewFile) return;

    if (previewAction.type === "rejected" && !rejectComment.trim()) {
      toast.error("Please provide a rejection comment");
      return;
    }

    try {
      setIsActionLoading(true);
      const accessToken = token || (await getAccessTokenSilently());

      const payload = {
        requestId: previewAction.requestId,
        documentId: previewAction.documentId,
        fileId: previewAction.fileId,
        action: previewAction.type,
        comment:
          previewAction.type === "rejected" ? rejectComment.trim() : undefined,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/requests/action`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update file status",
        );
      }

      toast.success(
        previewAction.type === "approved"
          ? "Contribution accepted successfully"
          : "Contribution rejected successfully",
      );

      await fetchRequests();
      closePreview();
    } catch (actionError) {
      console.error("Error performing action:", actionError);
      toast.error(
        actionError.response?.data?.message || "Failed to process action",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center py-10">
        <WaveLoader
          size="7em"
          primaryColor="hsl(220,90%,50%)"
          secondaryColor="hsl(300,90%,50%)"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-rose-700">
          Unable to load requests
        </h3>
        <p className="text-sm text-rose-700/90">{error}</p>
        <button
          type="button"
          onClick={fetchRequests}
          className="rounded-lg border border-rose-500/40 bg-background/85 px-4 py-2 text-sm font-medium text-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Request Control
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Your Requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review incoming contributions, approve the best file, or reject with
            feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setExpandedRequests({});
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Request
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Pending
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Reviewing
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.reviewing}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Completed
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Total
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.total}
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 py-14 text-center">
          <Book className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium">No requests yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Create your first request and manage contributions from the
            community.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {paginatedRequests.map((request) => {
            const isExpanded = Boolean(expandedRequests[request._id]);

            return (
              <article
                key={request._id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleRequestExpansion(request._id)}
                  className="w-full px-4 py-4 text-left sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {request.subjectCode || "Untitled Subject"}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {request.subject || "No subject name"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {request.postedAt
                            ? new Date(request.postedAt).toLocaleDateString()
                            : "Unknown date"}
                        </span>
                        <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5">
                          {request.branch} - {semesterLabel(request.semester)}
                        </span>
                        <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5">
                          {request.documents?.length || 0} document(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${requestStatusClass[request.status] || requestStatusClass.pending}`}
                      >
                        {request.status || "pending"}
                      </span>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteRequestId(request._id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 transition hover:bg-rose-500/20"
                        aria-label="Delete request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/70"
                    >
                      <div className="space-y-3 px-4 py-4 sm:px-5">
                        {(request.documents || []).map(
                          (document, documentIndex) => {
                            const files = [...(document.files || [])].sort(
                              (a, b) => {
                                const order = {
                                  approved: 0,
                                  pending: 1,
                                  reviewing: 2,
                                  rejected: 3,
                                };
                                return (
                                  (order[a.status] ?? 99) -
                                  (order[b.status] ?? 99)
                                );
                              },
                            );

                            const filesKey = `${request._id}-${document._id}`;
                            const filesExpanded = Boolean(
                              expandedFiles[filesKey],
                            );
                            const showExpand = files.length > 1;
                            const filesToShow =
                              showExpand && !filesExpanded ? [files[0]] : files;

                            return (
                              <div
                                key={
                                  document._id ||
                                  `${request._id}-${documentIndex}`
                                }
                                className="rounded-xl border border-border/70 bg-muted/30 p-3"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2">
                                      <BookOpenText className="h-4 w-4 text-primary" />
                                      <p className="text-sm font-medium sm:text-base">
                                        {document.name || "Untitled Item"}
                                      </p>
                                    </div>
                                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                      <Info className="h-3.5 w-3.5" />
                                      {document.description ||
                                        "No description provided"}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] ${fileTypeClass[document.type] || fileTypeClass.Other}`}
                                  >
                                    {document.type || "Other"}
                                  </span>
                                </div>

                                {files.length === 0 ? (
                                  <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                                    Awaiting contribution for this item.
                                  </div>
                                ) : (
                                  <div className="mt-3 space-y-2">
                                    {filesToShow.map((file) => (
                                      <div
                                        key={file.fileId}
                                        className="rounded-lg border border-border/70 bg-background/80 p-3"
                                      >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="min-w-0 flex-1">
                                            <p className="break-all text-sm font-medium">
                                              {file.fileName}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                              <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {file.contributedAt
                                                  ? new Date(
                                                      file.contributedAt,
                                                    ).toLocaleDateString()
                                                  : "Unknown date"}
                                              </span>
                                              <span className="inline-flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                @
                                                {file.contributedBy?.split(
                                                  ".",
                                                )[0] || "anonymous"}
                                              </span>
                                            </div>

                                            {file.rejectionComment && (
                                              <div className="mt-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
                                                <span className="font-medium">
                                                  Rejection reason:
                                                </span>{" "}
                                                {file.rejectionComment}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex flex-col items-end gap-2">
                                            <span
                                              className={`rounded-full border px-2.5 py-1 text-[11px] ${fileStatusClass[file.status] || fileStatusClass.pending}`}
                                            >
                                              {file.status || "pending"}
                                            </span>

                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setViewerFile(
                                                    file.webViewLink ||
                                                      file.webContentLink,
                                                  )
                                                }
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background/85 transition hover:bg-accent"
                                                title="View file"
                                              >
                                                <Eye className="h-4 w-4" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  window.open(
                                                    file.webContentLink,
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                  )
                                                }
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background/85 transition hover:bg-accent"
                                                title="Download file"
                                              >
                                                <Download className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        {file.status === "pending" && (
                                          <div className="mt-3 flex justify-end gap-2 border-t border-border/70 pt-3">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openPreview(
                                                  "approved",
                                                  request._id,
                                                  document._id,
                                                  file,
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20"
                                            >
                                              <Check className="h-3.5 w-3.5" />
                                              Accept
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openPreview(
                                                  "rejected",
                                                  request._id,
                                                  document._id,
                                                  file,
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-500/20"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                              Reject
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    {showExpand && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleFilesExpansion(
                                            request._id,
                                            document._id,
                                          )
                                        }
                                        className="text-xs font-medium text-primary"
                                      >
                                        {filesExpanded
                                          ? "Show less"
                                          : `Show all (${files.length}) files`}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-border/70 bg-background/85 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-border/70 bg-background/85 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
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
            isLoading={isAddingRequest}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewerFile && (
          <FileViewer url={viewerFile} onClose={() => setViewerFile(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteRequestId && (
          <ContributionModalPortal>
            <motion.div
              className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setDeleteRequestId(null);
                }
              }}
            >
              <motion.div
                className="w-full max-w-md rounded-2xl border border-border/70 bg-card shadow-xl"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="p-5">
                  <h3 className="text-lg font-semibold">Delete Request</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This action cannot be undone. Do you want to continue?
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteRequestId(null)}
                      className="flex-1 rounded-xl border border-border/70 bg-background/85 px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(deleteRequestId)}
                      className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ContributionModalPortal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreviewModal && previewFile && previewAction && (
          <ContributionModalPortal>
            <motion.div
              className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(event) => {
                if (event.target === event.currentTarget && !isActionLoading) {
                  closePreview();
                }
              }}
            >
              <motion.div
                className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl sm:max-h-[calc(100dvh-2rem)]"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        Review Contribution
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {previewAction.type === "approved"
                          ? "Confirm acceptance after verifying the file."
                          : "Provide a rejection reason before submitting."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closePreview}
                      disabled={isActionLoading}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 transition hover:bg-accent disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-4 rounded-xl border border-border/70 bg-muted/30 p-3">
                    <iframe
                      src={previewFile.webViewLink}
                      className="h-[45vh] w-full rounded-lg sm:h-[58vh]"
                      title="File Preview"
                    />
                  </div>

                  {previewAction.type === "rejected" && (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Rejection Comment
                      </label>
                      <textarea
                        value={rejectComment}
                        onChange={(event) =>
                          setRejectComment(event.target.value)
                        }
                        rows={3}
                        placeholder="Explain clearly why this file does not satisfy the request..."
                        className="w-full rounded-xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closePreview}
                      disabled={isActionLoading}
                      className="rounded-xl border border-border/70 bg-background/85 px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitPreviewAction}
                      disabled={
                        isActionLoading ||
                        (previewAction.type === "rejected" &&
                          !rejectComment.trim())
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${
                        previewAction.type === "approved"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {isActionLoading
                        ? previewAction.type === "approved"
                          ? "Accepting..."
                          : "Rejecting..."
                        : previewAction.type === "approved"
                          ? "Accept File"
                          : "Reject File"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ContributionModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewRequests;
