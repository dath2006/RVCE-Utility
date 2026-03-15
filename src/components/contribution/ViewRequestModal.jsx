import React from "react";
import { motion } from "framer-motion";
import { Clock3, Eye, Upload, X } from "lucide-react";

import ContributionModalPortal from "./ContributionModalPortal";

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

const ViewRequestModal = ({
  modalVariants,
  setIsViewModalOpen,
  selectedRequest,
  setActiveUpload,
}) => {
  const pendingDocuments = (selectedRequest.documents || []).filter(
    (item) =>
      !item.files ||
      !item.files.some((file) =>
        ["reviewing", "approved"].includes(file.status),
      ),
  );

  return (
    <ContributionModalPortal>
      <motion.div
        className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl sm:max-h-[calc(100dvh-2rem)]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
                <Eye className="h-5 w-5 text-primary" />
                Request Details
              </h2>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 transition hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 space-y-6 overflow-y-auto p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Subject Code
                </p>
                <p className="mt-1 font-medium break-all">
                  {selectedRequest.subjectCode || "Untitled Request"}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Subject
                </p>
                <p className="mt-1 font-medium">
                  {selectedRequest.subject || "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  User
                </p>
                <p className="mt-1 font-medium text-primary">
                  @{selectedRequest.user.split(".")[0]}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Branch
                </p>
                <p className="mt-1 font-medium">{selectedRequest.branch}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Semester
                </p>
                <p className="mt-1 font-medium">
                  {semesterLabel(selectedRequest.semester)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Posted {new Date(selectedRequest.postedAt).toLocaleDateString()}
              </div>

              <h3 className="mb-3 text-base font-semibold">
                Requested Items ({pendingDocuments.length})
              </h3>

              <div className="space-y-3">
                {pendingDocuments.map((item, index) => (
                  <div
                    key={item._id || `${item.name}-${index}`}
                    className="rounded-xl border border-border/70 bg-muted/35 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-medium sm:text-base">
                            {item.name}
                          </h4>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] ${typeStyles[item.type] || typeStyles.Other}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description ||
                            selectedRequest.description ||
                            "No extra description provided."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveUpload(index)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Contribute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl border border-border/70 bg-background/85 px-6 py-3 text-sm font-medium transition hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ContributionModalPortal>
  );
};

export default ViewRequestModal;
