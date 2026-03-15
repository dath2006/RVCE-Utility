import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Percent,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import WaveLoader from "./Loading";

const toneFromSubject = (subject) => {
  if (subject.pending > 0) return "warning";
  if (!subject.isEligible) return "danger";
  return "safe";
};

const chipClassesByTone = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300",
};

const warningBlockClassesByTone = {
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-300",
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300",
};

const Statistics = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [customMinAttendance, setCustomMinAttendance] = useState({});

  const hydrateData = (data) => {
    if (!data || !data.attendanceState) {
      setAttendanceData(null);
      return;
    }

    const initialMinAttendance = {};
    data.attendanceState.forEach((subject) => {
      initialMinAttendance[subject.courseId] = subject.minAttendance;
    });

    setAttendanceData(data);
    setCustomMinAttendance(initialMinAttendance);
  };

  const handleGetStats = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/attendance/statistics?email=${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        return res.data.data;
      }

      toast.error("Error fetching stats");
      return null;
    } catch (error) {
      toast.error("Error fetching stats");
      console.error("Error fetching stats:", error);
      return null;
    }
  }, [getAccessTokenSilently, user?.email]);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading || !isAuthenticated) return;

      setLoading(true);
      try {
        const data = await handleGetStats();
        hydrateData(data);
      } catch (error) {
        toast.error("Error fetching statistics");
        console.error("Error in fetchData:", error);
        setAttendanceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoading, isAuthenticated, handleGetStats]);

  const handleMinAttendanceUpdate = async (courseId) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/updatePercent`,
        {
          email: user.email,
          courseId,
          percentage: customMinAttendance[courseId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.success) {
        toast.error("Error updating minimum attendance");
        return;
      }

      toast.success("Minimum attendance updated");
      const data = await handleGetStats();
      hydrateData(data);
    } catch (error) {
      console.error(error);
      toast.error("Error updating minimum attendance");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <WaveLoader
          size="7em"
          primaryColor="hsl(220,90%,50%)"
          secondaryColor="hsl(300,90%,50%)"
        />
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="grid min-h-[260px] place-items-center text-center text-muted-foreground">
        <p>No attendance data available.</p>
      </div>
    );
  }

  const overall = attendanceData.overallAttendanceState;
  const effectiveTotalClasses = overall.totalClasses - overall.ignore;

  return (
    <div className="relative p-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(circle at center, black 36%, transparent 82%)",
        }}
      />

      <div className="relative flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/80 shadow-md">
            <CardHeader className="gap-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    Attendance Analytics
                  </CardTitle>
                  <CardDescription>
                    Track your trend, risk zones, and eligibility.
                  </CardDescription>
                </div>

                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-sm font-bold"
                >
                  {overall.attendancePercent}% overall
                </Badge>
              </div>

              {overall.pending > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit gap-1.5 rounded-full border-amber-300 bg-amber-100/70 px-3 py-1 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-300",
                  )}
                >
                  <Clock size={14} />
                  {overall.pending} pending entries can affect final percentage.
                </Badge>
              )}

              {overall.pending === 0 && overall.attendancePercent < 85 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit gap-1.5 rounded-full border-red-300 bg-red-100/70 px-3 py-1 text-red-900 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300",
                  )}
                >
                  <AlertTriangle size={14} />
                  Overall attendance is below recommended threshold.
                </Badge>
              )}
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2 p-4 pt-0 sm:grid-cols-4 sm:p-5 sm:pt-0">
              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <Check size={15} className="mx-auto" />
                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Present
                </p>
                <p className="mt-1 text-2xl font-extrabold leading-none">
                  {overall.present}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <X size={15} className="mx-auto" />
                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Absent
                </p>
                <p className="mt-1 text-2xl font-extrabold leading-none">
                  {overall.absent}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <Clock size={15} className="mx-auto" />
                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-extrabold leading-none">
                  {overall.pending}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <Calendar size={15} className="mx-auto" />
                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Classes
                </p>
                <p className="mt-1 text-2xl font-extrabold leading-none">
                  {effectiveTotalClasses}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-3.5">
          {attendanceData.attendanceState.map((subject, index) => {
            const subjectTotal = subject.totalClasses - subject.ignore;
            const tone = toneFromSubject(subject);
            const isOpen = expandedSubject === subject.courseId;

            return (
              <motion.div
                key={subject.courseId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden border-border/80 shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition-colors hover:bg-muted/40 sm:p-4"
                    onClick={() =>
                      setExpandedSubject(isOpen ? null : subject.courseId)
                    }
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[0.98rem] font-semibold">
                        {subject.courseId}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Minimum target: {subject.minAttendance}%
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {subject.pending > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 rounded-full",
                            chipClassesByTone.warning,
                          )}
                        >
                          <Clock size={12} />
                          {subject.pending} pending
                        </Badge>
                      )}

                      {!subject.isEligible && subject.pending === 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 rounded-full",
                            chipClassesByTone.danger,
                          )}
                        >
                          <AlertTriangle size={12} />
                          Not eligible
                        </Badge>
                      )}

                      {tone === "safe" && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 rounded-full",
                            chipClassesByTone.safe,
                          )}
                        >
                          <Award size={12} />
                          Eligible
                        </Badge>
                      )}

                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 rounded-full",
                          chipClassesByTone[tone],
                        )}
                      >
                        <Percent size={12} />
                        {subject.attendancePercentage}%
                      </Badge>

                      {isOpen ? (
                        <ChevronUp size={18} className="shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="shrink-0" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t"
                      >
                        <div className="p-3.5 sm:p-4">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <div className="rounded-lg border bg-muted/40 p-3">
                              <Check size={14} className="text-emerald-600" />
                              <p className="mt-1 text-base font-bold leading-none">
                                {subject.present}
                              </p>
                              <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                Present
                              </p>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-3">
                              <X size={14} className="text-red-600" />
                              <p className="mt-1 text-base font-bold leading-none">
                                {subject.absent}
                              </p>
                              <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                Absent
                              </p>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-3">
                              <Calendar size={14} className="text-blue-600" />
                              <p className="mt-1 text-base font-bold leading-none">
                                {subjectTotal}
                              </p>
                              <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                Total Classes
                              </p>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-3">
                              <Percent size={14} className="text-violet-600" />
                              <p className="mt-1 text-base font-bold leading-none">
                                {subject.minAttendance}%
                              </p>
                              <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                Required
                              </p>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-3">
                              <Award
                                size={14}
                                className={cn(
                                  subject.isEligible
                                    ? "text-emerald-600"
                                    : "text-slate-400",
                                )}
                              />
                              <p className="mt-1 text-base font-bold leading-none">
                                {subject.isEligible ? "Yes" : "No"}
                              </p>
                              <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                Eligible
                              </p>
                            </div>

                            {subject.classCount?.requiredPresent !==
                              undefined && (
                              <div className="rounded-lg border bg-muted/40 p-3">
                                <Bell size={14} className="text-amber-600" />
                                <p className="mt-1 text-base font-bold leading-none">
                                  {subject.classCount.requiredPresent}
                                </p>
                                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                  Required Present
                                </p>
                              </div>
                            )}

                            {subject.classCount?.allowedAbsent !==
                              undefined && (
                              <div className="rounded-lg border bg-muted/40 p-3">
                                <AlertTriangle
                                  size={14}
                                  className="text-orange-600"
                                />
                                <p className="mt-1 text-base font-bold leading-none">
                                  {subject.classCount.allowedAbsent}
                                </p>
                                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                  Allowed Absent
                                </p>
                              </div>
                            )}
                          </div>

                          {subject.pending > 0 && (
                            <div
                              className={cn(
                                "mt-3.5 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                                warningBlockClassesByTone.warning,
                              )}
                            >
                              <Clock size={16} className="mt-0.5 shrink-0" />
                              <span>
                                Attendance percentage may change after pending
                                classes are updated.
                              </span>
                            </div>
                          )}

                          {!subject.isEligible && subject.pending === 0 && (
                            <div
                              className={cn(
                                "mt-3.5 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                                warningBlockClassesByTone.danger,
                              )}
                            >
                              <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0"
                              />
                              <span>
                                Attendance is below minimum requirement (
                                {subject.minAttendance}%).
                                {subject.classCount?.requiredPresent !==
                                  undefined && (
                                  <>
                                    {" "}
                                    Attend {
                                      subject.classCount.requiredPresent
                                    }{" "}
                                    more class(es) to recover eligibility.
                                  </>
                                )}
                              </span>
                            </div>
                          )}

                          <div className="mt-4 border-t border-dashed pt-3.5">
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Custom minimum attendance
                              </p>
                              <span className="text-sm font-bold text-primary">
                                {customMinAttendance[subject.courseId]}%
                              </span>
                            </div>

                            <input
                              type="range"
                              min={50}
                              max={100}
                              step={1}
                              value={
                                customMinAttendance[subject.courseId] ?? 75
                              }
                              onChange={(event) => {
                                const numericValue = Number.parseInt(
                                  event.target.value,
                                  10,
                                );
                                setCustomMinAttendance((prev) => ({
                                  ...prev,
                                  [subject.courseId]: Number.isNaN(numericValue)
                                    ? prev[subject.courseId]
                                    : numericValue,
                                }));
                              }}
                              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                            />

                            <div className="mt-1.5 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                              <span>50%</span>
                              <span>100%</span>
                            </div>

                            <Button
                              type="button"
                              className="mt-3 inline-flex h-9 items-center gap-1.5 px-3 text-xs"
                              onClick={() =>
                                handleMinAttendanceUpdate(subject.courseId)
                              }
                            >
                              <Edit2 size={13} />
                              Update Threshold
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
