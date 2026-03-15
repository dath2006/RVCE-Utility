import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  FileText,
  Layers,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "sonner";

import ContributionModalPortal from "./ContributionModalPortal";
import FileViewer from "../FileViewer";
import WaveLoader from "../Loading";
import useBottomBarVisibility from "../../hooks/useBottomBarVisibility";

const statusClass = {
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  reviewing: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
};

const semesterLabel = (semester) => {
  const value = Number(semester);
  if (value === 1) return "C Cycle";
  if (value === 2) return "P Cycle";
  return `Sem ${semester}`;
};

const ViewContribution = ({ userRank }) => {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [viewerFile, setViewerFile] = useState(null);

  useBottomBarVisibility(!!viewerFile, "file-viewer-contribution");

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthLoading || !isAuthenticated || !user?.email) {
        return;
      }

      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/getData?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          setResources(response.data.resources || []);
        } else {
          toast.error("Failed to load your contributions");
        }
      } catch (error) {
        console.error("Error fetching contributions:", error);
        toast.error("Failed to load your contributions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, isAuthLoading, isAuthenticated, user?.email]);

  const flattenedDocuments = useMemo(() => {
    return resources.flatMap((resource) => resource.documents || []);
  }, [resources]);

  const stats = useMemo(() => {
    return flattenedDocuments.reduce(
      (acc, document) => {
        const status = document.status || "pending";
        if (status === "approved") acc.approved += 1;
        else if (status === "rejected") acc.rejected += 1;
        else acc.pending += 1;

        acc.total += 1;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0, total: 0 },
    );
  }, [flattenedDocuments]);

  const docsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(resources.length / docsPerPage));

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * docsPerPage;
    return resources.slice(start, start + docsPerPage);
  }, [currentPage, resources]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSubject = (subjectKey) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectKey]: !prev[subjectKey],
    }));
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

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Contribution Insights
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Your Contributions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track each upload, check file status, and review admin feedback.
          </p>
        </div>

        {typeof userRank === "number" && (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <BarChart2 className="h-3.5 w-3.5" />
            Rank #{userRank}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Accepted
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.approved}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Rejected
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.rejected}
          </p>
        </div>
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
            Total Files
          </p>
          <p className="mt-1 text-lg font-semibold sm:text-2xl">
            {stats.total}
          </p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 py-14 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium">No contributions yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Start uploading notes, labs, or question papers to see your activity
            here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {paginatedResources.map((resource, index) => {
            const documents = resource.documents || [];
            const firstDocument = documents[0] || {};
            const subjectKey =
              firstDocument._id ||
              `${firstDocument.subjectCode || "subject"}-${index}`;
            const isExpanded = Boolean(expandedSubjects[subjectKey]);

            const subjectStats = documents.reduce(
              (acc, file) => {
                if (file.status === "approved") acc.approved += 1;
                else if (file.status === "rejected") acc.rejected += 1;
                else acc.pending += 1;
                return acc;
              },
              { approved: 0, rejected: 0, pending: 0 },
            );

            return (
              <article
                key={subjectKey}
                className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleSubject(subjectKey)}
                  className="w-full px-4 py-4 text-left sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {firstDocument.subject ||
                          firstDocument.subjectCode ||
                          "Untitled Subject"}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {documents.length} file(s)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />@
                          {firstDocument.contributedTo?.split(".")[0] ||
                            "open-contribution"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {firstDocument.branch || "N/A"} -{" "}
                          {semesterLabel(firstDocument.semester)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {subjectStats.pending > 0 && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-600">
                          {subjectStats.pending} pending
                        </span>
                      )}
                      {subjectStats.rejected > 0 && (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-600">
                          {subjectStats.rejected} rejected
                        </span>
                      )}
                      {subjectStats.approved > 0 && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-600">
                          {subjectStats.approved} accepted
                        </span>
                      )}

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
                        {documents.map((document, docIndex) => {
                          const status = document.status || "pending";

                          return (
                            <div
                              key={document._id || `${subjectKey}-${docIndex}`}
                              className="rounded-xl border border-border/70 bg-muted/30 p-3"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate text-sm font-medium sm:text-base">
                                    {document.fileName || "Untitled File"}
                                  </h4>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Uploaded on{" "}
                                    {document.uploadedAt
                                      ? new Date(
                                          document.uploadedAt,
                                        ).toLocaleDateString()
                                      : "Unknown date"}
                                  </p>

                                  {document.rejectionComment && (
                                    <div className="mt-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
                                      <span className="font-medium">
                                        Rejection reason:
                                      </span>{" "}
                                      {document.rejectionComment}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 self-start">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${statusClass[status] || statusClass.pending}`}
                                  >
                                    {status === "approved" ? (
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : status === "rejected" ? (
                                      <XCircle className="h-3.5 w-3.5" />
                                    ) : (
                                      <Clock3 className="h-3.5 w-3.5" />
                                    )}
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewerFile(
                                        document.webViewLink ||
                                          document.webContentLink,
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/85 px-3 py-1.5 text-xs font-medium transition hover:bg-accent"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
        {viewerFile && (
          <ContributionModalPortal>
            <FileViewer url={viewerFile} onClose={() => setViewerFile(null)} />
          </ContributionModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewContribution;
