import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Layers3, Plus, Tag, X } from "lucide-react";

import ContributionModalPortal from "./ContributionModalPortal";
import WaveLoader from "../Loading";

const inputClass =
  "w-full rounded-xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

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
    <ContributionModalPortal>
      <motion.div
        className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsAddModalOpen(false);
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
          {isLoading ? (
            <div className="flex min-h-[140px] items-center justify-center">
              <WaveLoader
                size="3em"
                primaryColor="hsl(220,90%,50%)"
                secondaryColor="hsl(300,90%,50%)"
              />
            </div>
          ) : (
            <>
              <div className="border-b border-border/70 px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      New Request
                    </p>
                    <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                      Create Resource Request
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add subject details and describe the exact resources you
                      need.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 transition hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleAddRequest}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
              >
                <div className="space-y-6">
                  <section className="rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Request Details
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
                          className={inputClass}
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
                          ].map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
                          className={inputClass}
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

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
                          placeholder="Example: CS222IA"
                          className={inputClass}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
                          placeholder="Example: C Programming"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Requested Items
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={addNewItem}
                        className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/85 px-3 py-2 text-sm font-medium transition hover:bg-accent"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newRequest.items.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-border/70 bg-muted/35 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Item Name
                                  </label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) =>
                                      updateItem(index, "name", e.target.value)
                                    }
                                    placeholder="Example: Unit 5 sensors"
                                    className={inputClass}
                                    required
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Type
                                  </label>
                                  <select
                                    value={item.type}
                                    onChange={(e) =>
                                      updateItem(index, "type", e.target.value)
                                    }
                                    className={inputClass}
                                  >
                                    <option value="Notes">Notes</option>
                                    <option value="QP">Question Paper</option>
                                    <option value="Textbook">Textbook</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5" />
                                  Description
                                </label>
                                <textarea
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Mention specific units, lecturer notes, editions, or any context that helps contributors."
                                  rows={3}
                                  maxLength={200}
                                  className={`${inputClass} min-h-[96px] resize-none`}
                                />
                              </div>
                            </div>

                            {newRequest.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 text-rose-500 transition hover:bg-rose-500/10"
                                aria-label="Remove request item"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border/70 bg-card/95 px-0 pb-0 pt-4 backdrop-blur sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-xl border border-border/70 bg-background/85 px-5 py-3 text-sm font-medium transition hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Request
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </ContributionModalPortal>
  );
};

export default AddRequest;
