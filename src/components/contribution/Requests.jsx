import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Filter,
  FolderOpen,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";

import FilterRequests from "./FilterRequests";
import AddRequest from "./AddRequest";
import ContributionModalPortal from "./ContributionModalPortal";
import ViewRequestModal from "./ViewRequestModal";
import WaveLoader from "../Loading";
import useBottomBarVisibility from "../../hooks/useBottomBarVisibility";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const typeStyles = {
  Notes: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  QP: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Textbook: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  Lab: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Other: "bg-slate-500/10 text-slate-700 border-slate-500/20",
};

const semesterLabel = (semester) => {
  const value = Number(semester);
  if (value === 1) return "C Cycle";
  if (value === 2) return "P Cycle";
  return `Sem ${semester}`;
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
  const [filters, setFilters] = useState({ semester: "", branch: "" });
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
  const [isLoading, setIsLoading] = useState(false);

  const filterRef = useRef(null);

  useBottomBarVisibility(isAddModalOpen, "add-request-modal");
  useBottomBarVisibility(!!activeUpload, "upload-modal");
  useBottomBarVisibility(showCancelConfirm, "cancel-confirm-modal");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || isAuthLoading || !user?.email) return;

      try {
        setIsLoadingRequests(true);
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/requests?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setRequests(response.data || []);
        setError(null);
      } catch (requestError) {
        console.error("Error fetching requests:", requestError);
        setError("Failed to load requests. Please try again later.");
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [getAccessTokenSilently, isAuthLoading, isAuthenticated, user?.email]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ semester: "", branch: "" });
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(
    filters.semester || filters.branch || searchQuery,
  );

  const handleAddRequest = async (event) => {
    event.preventDefault();
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
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      setIsAddModalOpen(false);
      setNewRequest({
        branch: "",
        semester: "",
        subject: "",
        subjectCode: "",
        items: [{ name: "", type: "Notes", description: "" }],
      });
      toast.success("Request created successfully");
    } catch (requestError) {
      console.error("Error creating request:", requestError);
      toast.error("Failed to create request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        !searchQuery ||
        request._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.subjectCode
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.documents?.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesSemester =
        !filters.semester || request.semester?.toString() === filters.semester;
      const matchesBranch =
        !filters.branch || request.branch === filters.branch;

      return matchesSearch && matchesSemester && matchesBranch;
    });
  }, [filters.branch, filters.semester, requests, searchQuery]);

  const openRequestsCount = useMemo(() => {
    return filteredRequests.filter((request) =>
      request.documents?.some(
        (item) =>
          !item.files ||
          !item.files.some((file) =>
            ["reviewing", "approved"].includes(file.status),
          ),
      ),
    ).length;
  }, [filteredRequests]);

  const pendingItemsCount = useMemo(() => {
    return filteredRequests.reduce((count, request) => {
      const pendingItems = (request.documents || []).filter(
        (item) =>
          !item.files ||
          !item.files.some((file) =>
            ["reviewing", "approved"].includes(file.status),
          ),
      );
      return count + pendingItems.length;
    }, 0);
  }, [filteredRequests]);

  const handleFileSelect = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 20MB limit");
      return;
    }

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
        "Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX and TXT files are allowed",
      );
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [index]: file }));
  };

  const handleUpload = async (index) => {
    const file = selectedFiles[index];
    if (!file || !isAuthenticated || !selectedRequest) return;

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
        }),
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
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress((prev) => ({
              ...prev,
              [index]: percentCompleted,
            }));
          },
        },
      );

      if (response.data.success) {
        toast.success("File uploaded successfully");
        setTimeout(() => {
          setActiveUpload(null);
          setSelectedFiles((prev) => ({ ...prev, [index]: null }));
          setUploadProgress((prev) => ({ ...prev, [index]: 0 }));
        }, 900);
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(
        uploadError.response?.data?.message || "Failed to upload file",
      );
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
      items: [...prev.items, { name: "", type: "Notes", description: "" }],
    }));
  };

  const removeItem = (index) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
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

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  if (isLoadingRequests) {
    return (
      <div className="flex min-h-[340px] items-center justify-center py-10">
        <WaveLoader
          size="7em"
          primaryColor="hsl(220,90%,50%)"
          secondaryColor="hsl(300,90%,50%)"
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Requests Hub
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Resource Requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse pending community requests, filter by branch or semester, and
            contribute directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Request
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                hasActiveFilters
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-background/80 text-foreground hover:bg-accent"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                  {(filters.branch ? 1 : 0) +
                    (filters.semester ? 1 : 0) +
                    (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <FilterRequests
                  clearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border/70 bg-background/80 px-2.5 py-3 sm:p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.14em]">
            Visible Requests
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {filteredRequests.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-2.5 py-3 sm:p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.14em]">
            Open Requests
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {openRequestsCount}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-2.5 py-3 sm:p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.14em]">
            Pending Items
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {pendingItemsCount}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                Search: {searchQuery}
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {filters.semester && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/55 px-3 py-1 text-xs text-foreground">
                {semesterLabel(filters.semester)}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, semester: "" }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {filters.branch && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/55 px-3 py-1 text-xs text-foreground">
                {filters.branch}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, branch: "" }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border/80 bg-muted/35">
            <FolderOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-xl font-medium">
            {hasActiveFilters
              ? "No matching requests found"
              : "No requests found"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters or search term to broaden the result set."
              : "Be the first to create a resource request for the community."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-primary"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filteredRequests.map((request, index) => {
            const pendingDocuments = (request.documents || []).filter(
              (item) =>
                !item.files ||
                !item.files.some((file) =>
                  ["reviewing", "approved"].includes(file.status),
                ),
            );

            return (
              <motion.article
                key={request._id || `${request.subjectCode}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm"
              >
                <div className="border-b border-border/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {request.subjectCode || "Untitled Request"}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {request.subject || "No subject name"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="rounded-full border border-border/70 bg-muted/55 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {request.branch}
                      </span>
                      <span className="rounded-full border border-border/70 bg-muted/55 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {semesterLabel(request.semester)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-4 py-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(request.postedAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {pendingDocuments.length} pending
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingDocuments.slice(0, 3).map((item, itemIndex) => (
                      <div
                        key={item._id || `${item.name}-${itemIndex}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/35 px-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                            typeStyles[item.type] || typeStyles.Other
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                    ))}

                    {pendingDocuments.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{pendingDocuments.length - 3} more item(s)
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                    <p className="truncate text-xs text-muted-foreground">
                      @{request.user?.split(".")?.[0] || "unknown"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleViewRequest(request)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/85 px-3 py-2 text-sm font-medium transition hover:bg-accent"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
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

      <AnimatePresence>
        {isViewModalOpen && selectedRequest && (
          <ViewRequestModal
            modalVariants={modalVariants}
            setIsViewModalOpen={setIsViewModalOpen}
            selectedRequest={selectedRequest}
            setActiveUpload={setActiveUpload}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeUpload !== null && selectedRequest && (
          <ContributionModalPortal>
            <motion.div
              className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-2 backdrop-blur-sm sm:items-center sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-xl sm:max-h-[calc(100dvh-2rem)]"
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
              >
                <div className="border-b border-border/70 px-5 py-4 text-center">
                  <h4 className="text-lg font-semibold">Upload Contribution</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRequest.documents[activeUpload]?.name}
                  </p>
                </div>

                <div className="p-5">
                  <div
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                      selectedFiles[activeUpload]
                        ? "border-primary/45 bg-primary/10"
                        : "border-border/70 bg-muted/35"
                    }`}
                  >
                    <input
                      type="file"
                      id={`file-upload-${activeUpload}`}
                      className="hidden"
                      onChange={(event) =>
                        handleFileSelect(event, activeUpload)
                      }
                      accept=".pdf,.doc,.docx,.txt,.pptx,.ppt"
                      disabled={isUploading || uploadProgress[activeUpload] > 0}
                    />
                    <label
                      htmlFor={`file-upload-${activeUpload}`}
                      className={`block ${uploadProgress[activeUpload] > 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="mt-3 text-sm">
                        {selectedFiles[activeUpload] ? (
                          <>
                            <span className="block font-medium text-primary">
                              {selectedFiles[activeUpload].name}
                            </span>
                            <span className="text-muted-foreground">
                              {(
                                selectedFiles[activeUpload].size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">
                              Choose a file to upload
                            </span>
                            <p className="mt-1 text-muted-foreground">
                              PDF, DOC, DOCX, TXT, PPT, PPTX up to 20MB
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {uploadProgress[activeUpload] > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Uploading...
                        </span>
                        <span className="font-medium text-primary">
                          {uploadProgress[activeUpload]}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${uploadProgress[activeUpload]}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleCancelUpload(activeUpload)}
                      disabled={
                        isUploading ||
                        (uploadProgress[activeUpload] > 0 &&
                          uploadProgress[activeUpload] < 100)
                      }
                      className="flex-1 rounded-xl border border-border/70 bg-background/85 px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpload(activeUpload)}
                      disabled={
                        !selectedFiles[activeUpload] ||
                        isUploading ||
                        (uploadProgress[activeUpload] > 0 &&
                          uploadProgress[activeUpload] < 100)
                      }
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUploading
                        ? "Uploading..."
                        : uploadProgress[activeUpload] === 100
                          ? "Complete"
                          : "Upload"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ContributionModalPortal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelConfirm && (
          <ContributionModalPortal>
            <motion.div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-sm rounded-2xl border border-border/70 bg-card shadow-xl"
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
              >
                <div className="p-5 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                    <X className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Cancel upload?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your selected file will be removed from the queue.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 rounded-xl border border-border/70 bg-background/85 px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
                    >
                      Keep file
                    </button>
                    <button
                      type="button"
                      onClick={confirmCancel}
                      className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                    >
                      Cancel upload
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

export default Requests;
