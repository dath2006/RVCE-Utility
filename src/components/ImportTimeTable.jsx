import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Flag,
  ThumbsDown,
  ThumbsUp,
  Users,
  WandSparkles,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const modeMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const attendanceLevels = [75, 80, 85, 90, 95];
const FILTER_STORAGE_KEY = "attendanceCommunityFilters";
const CONSENT_REDIRECT_FLAG = "auth0_consent_redirect_in_progress";

const semesterOptions = Array.from({ length: 8 }, (_, index) => {
  const value = String(index + 1);
  return {
    value,
    label: `${value}${value === "1" ? "st" : value === "2" ? "nd" : value === "3" ? "rd" : "th"} Semester`,
  };
});

const allDepartments = [
  { code: "AI", name: "Artificial Intelligence", sections: ["A", "B", "C"] },
  { code: "AS", name: "Aerospace Engineering", sections: [] },
  { code: "BT", name: "Biotechnology", sections: [] },
  { code: "CD", name: "Data Science", sections: [] },
  { code: "CH", name: "Chemical Engineering", sections: [] },
  {
    code: "CS",
    name: "Computer Science",
    sections: ["A", "B", "C", "D", "E", "F"],
  },
  { code: "CV", name: "Civil Engineering", sections: [] },
  { code: "CY", name: "Cyber Security", sections: [] },
  {
    code: "EC",
    name: "Electronics & Communication",
    sections: ["A", "B", "C", "D"],
  },
  { code: "EE", name: "Electrical Engineering", sections: [] },
  { code: "ET", name: "Electronics & Telecommunication", sections: [] },
  { code: "IM", name: "Industrial Management", sections: [] },
  { code: "ME", name: "Mechanical Engineering", sections: ["A", "B"] },
];

const departmentDataBySemester = semesterOptions.reduce((acc, option) => {
  acc[option.value] = allDepartments;
  return acc;
}, {});

const getAcademicStartYear = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

const getAcademicYearLabel = (startYear) => {
  const suffix = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${suffix}`;
};

const sortByScore = (rows) =>
  [...rows].sort((a, b) => {
    const scoreDiff = (b.voteScore || 0) - (a.voteScore || 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return (
      new Date(b.updatedAt || b.createdAt || 0).getTime() -
      new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  });

const isConsentRequiredError = (error) => {
  const normalizedCode = String(
    error?.error || error?.code || "",
  ).toLowerCase();
  const normalizedMessage = String(error?.message || "").toLowerCase();
  return (
    normalizedCode === "consent_required" ||
    normalizedMessage.includes("consent required")
  );
};

const previewDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const formatDateLabel = (value) => {
  if (!value) {
    return "-";
  }

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const ImportTimeTable = ({
  onCreateClick,
  setActiveComponent,
  setHasTimeTable,
}) => {
  const [activeTab, setActiveTab] = useState("import");
  const [sem, setSem] = useState("");
  const [dept, setDept] = useState("");
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [selectedDept, setSelectedDept] = useState(null);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [createdYear, setCreatedYear] = useState(
    String(getAcademicStartYear()),
  );
  const [communityRows, setCommunityRows] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [myVotes, setMyVotes] = useState({});
  const yearOptions = useMemo(() => {
    const start = getAcademicStartYear();
    return [start - 1, start, start + 1, start + 2].map((year) => ({
      value: String(year),
      label: getAcademicYearLabel(year),
    }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const semester =
        parsed?.semester || localStorage.getItem("attendanceSem") || "";
      const branch =
        parsed?.branch || localStorage.getItem("attendanceBranch") || "";
      const year = parsed?.year || localStorage.getItem("attendanceYear") || "";
      const minAttendance =
        parsed?.minAttendance ||
        localStorage.getItem("attendanceMinAttendance");

      if (semester) {
        setSem(String(semester));
      }
      if (branch) {
        setDept(String(branch));
      }
      if (year) {
        setCreatedYear(String(year));
      }
      if (minAttendance) {
        setAttendancePercent(Number(minAttendance));
      }
    } catch (error) {
      console.error(
        "Failed to read stored attendance community filters",
        error,
      );
    }
  }, []);

  useEffect(() => {
    if (!sem) {
      setAvailableDepartments([]);
      setSelectedDept(null);
      return;
    }

    const departments = departmentDataBySemester[sem] || [];
    setAvailableDepartments(departments);

    const foundDept = departments.find(
      (department) => department.code === dept,
    );
    if (!foundDept) {
      setDept("");
      setSelectedDept(null);
      return;
    }

    setSelectedDept(foundDept);
  }, [sem]);

  useEffect(() => {
    if (!dept) {
      setSelectedDept(null);
      return;
    }

    const deptInfo = availableDepartments.find(
      (department) => department.code === dept,
    );
    setSelectedDept(deptInfo || null);
  }, [dept, availableDepartments]);

  const handleDeptChange = (selectedCode) => {
    setDept(selectedCode);
  };

  const getDefaultDates = (semester) => {
    if (semester === "1") {
      return {
        courseStart: new Date("2025-09-08"),
        courseEnd: new Date("2025-12-12"),
      };
    }

    return {
      courseStart: new Date("2025-09-29"),
      courseEnd: new Date("2026-01-31"),
    };
  };

  const canBrowseCommunity = Boolean(sem && dept && createdYear);
  const previewSemester = selectedCommunity?.semester || sem;
  const previewDates = useMemo(
    () => getDefaultDates(previewSemester),
    [previewSemester],
  );

  const getTokenWithConsent = async () => {
    try {
      const token = await getAccessTokenSilently();
      sessionStorage.removeItem(CONSENT_REDIRECT_FLAG);
      return token;
    } catch (error) {
      if (isConsentRequiredError(error)) {
        if (sessionStorage.getItem(CONSENT_REDIRECT_FLAG) !== "1") {
          sessionStorage.setItem(CONSENT_REDIRECT_FLAG, "1");
          await loginWithRedirect({
            appState: {
              returnTo: `${window.location.pathname}${window.location.search}`,
            },
            authorizationParams: {
              audience: import.meta.env.VITE_API_URL,
              scope: "openid profile email offline_access",
              prompt: "consent",
            },
          });
        }
        return null;
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!sem && !dept) {
      return;
    }

    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        semester: sem,
        branch: dept,
        year: createdYear,
        minAttendance: attendancePercent,
      }),
    );

    localStorage.setItem("attendanceSem", sem || "");
    localStorage.setItem("attendanceBranch", dept || "");
    localStorage.setItem("attendanceYear", createdYear || "");
    localStorage.setItem("attendanceMinAttendance", String(attendancePercent));
  }, [sem, dept, createdYear, attendancePercent]);

  useEffect(() => {
    if (activeTab !== "import") {
      return;
    }

    if (!canBrowseCommunity || isLoading || !isAuthenticated) {
      setCommunityRows([]);
      setSelectedCommunity(null);
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoadingCommunity(true);
        const token = await getTokenWithConsent();
        if (!token) {
          return;
        }
        const params = new URLSearchParams({
          semester: sem,
          branch: dept,
          year: createdYear,
        });

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/community/timetables?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (isCancelled) {
          return;
        }

        const rows = sortByScore(res.data?.data || []);
        setCommunityRows(rows);
        setSelectedCommunity((previous) => {
          if (!previous?._id) {
            return null;
          }

          return rows.some((row) => row._id === previous._id) ? previous : null;
        });
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          toast.error("Failed to load community timetables.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingCommunity(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    activeTab,
    canBrowseCommunity,
    createdYear,
    dept,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    sem,
  ]);

  const fetchCommunityDetail = async (id) => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    try {
      setLoadingPreview(true);
      const token = await getTokenWithConsent();
      if (!token) {
        return;
      }
      const query = new URLSearchParams({ userEmail: user.email }).toString();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/community/timetables/${id}?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const detail = res.data?.data;
      setSelectedCommunity(detail);
      setMyVotes((prev) => ({ ...prev, [id]: detail?.myVote ?? 0 }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load timetable preview.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const openCommunityPreview = async (row) => {
    setIsPreviewOpen(true);
    setSelectedCommunity(row);
    await fetchCommunityDetail(row._id);
  };

  const handleImportCommunity = async (communityId) => {
    if (!communityId || isSubmitting || isLoading || !isAuthenticated) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getTokenWithConsent();
      if (!token) {
        return;
      }
      const { courseStart, courseEnd } = getDefaultDates(sem);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/timetables/import`,
        {
          timetableId: communityId,
          user: {
            fullName: user.name,
            email: user.email,
            imageUrl: user.picture,
            semester: sem,
            branch: dept,
            section: selectedCommunity?.section || "",
            minAttendance: attendancePercent,
            courseStart,
            courseEnd,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.success) {
        toast.error("Failed to import timetable. Please try again.");
        return;
      }

      toast.success("Community timetable imported successfully!");
      setHasTimeTable(true);
      setActiveComponent("main");
    } catch (err) {
      console.error(err);
      toast.error("Failed to import timetable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModifyThenImport = () => {
    if (!selectedCommunity?.timeTable) {
      toast.error("Open timetable preview before modifying.");
      return;
    }

    sessionStorage.setItem(
      "communityTimetablePrefill",
      JSON.stringify({
        semester: sem,
        branch: dept,
        section: selectedCommunity?.section || "",
        minAttendance: attendancePercent,
        timeTable: selectedCommunity.timeTable,
      }),
    );
    onCreateClick(true);
  };

  const handleVote = async (communityId, vote) => {
    if (!communityId || isLoading || !isAuthenticated) {
      return;
    }

    const currentVote = myVotes[communityId] ?? 0;
    const nextVote = currentVote === vote ? 0 : vote;

    try {
      const token = await getTokenWithConsent();
      if (!token) {
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/timetables/${communityId}/vote`,
        {
          userEmail: user.email,
          vote: nextVote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.success) {
        toast.error("Unable to update vote.");
        return;
      }

      setMyVotes((prev) => ({ ...prev, [communityId]: nextVote }));
      setCommunityRows((prev) => {
        const nextRows = prev.map((row) =>
          row._id === communityId
            ? {
                ...row,
                voteScore: res.data.data.voteScore,
                upvoteCount: res.data.data.upvotes,
                downvoteCount: res.data.data.downvotes,
              }
            : row,
        );

        return sortByScore(nextRows);
      });

      if (selectedCommunity?._id === communityId) {
        setSelectedCommunity((prev) =>
          prev
            ? {
                ...prev,
                voteScore: res.data.data.voteScore,
                upvoteCount: res.data.data.upvotes,
                downvoteCount: res.data.data.downvotes,
                myVote: nextVote,
              }
            : prev,
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to update vote.");
    }
  };

  const handleReport = async (communityId) => {
    const reason = window.prompt("Report reason (short)");
    if (!reason) {
      return;
    }

    try {
      const token = await getTokenWithConsent();
      if (!token) {
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/timetables/${communityId}/report`,
        {
          userEmail: user.email,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.success) {
        toast.error(res.data.message || "Unable to report timetable.");
        return;
      }

      setCommunityRows((prev) =>
        prev.map((row) =>
          row._id === communityId
            ? { ...row, reportCount: res.data.data.reportCount }
            : row,
        ),
      );

      toast.success("Reported successfully. Thanks for helping the community.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to report timetable.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <CardHeader className="border-b border-border/70 bg-muted/40 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">
                Attendance Import
              </CardTitle>
              <div className="inline-flex rounded-xl border border-border/70 bg-background p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("import")}
                  className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "import"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Users className="h-4.5 w-4.5" />
                  Community
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <WandSparkles className="h-4.5 w-4.5" />
                  Custom
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-3 sm:p-4">
            <AnimatePresence mode="wait">
              {activeTab === "import" ? (
                <motion.div key="import" {...modeMotion} className="space-y-4">
                  <Card className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Semester
                        </label>
                        <Select value={sem} onValueChange={setSem}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Sem" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesterOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Branch
                        </label>
                        <Select
                          value={dept}
                          onValueChange={handleDeptChange}
                          disabled={!sem}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue
                              placeholder={sem ? "Branch" : "Pick sem"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDepartments.map((department) => (
                              <SelectItem
                                key={department.code}
                                value={department.code}
                              >
                                {department.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Academic Year
                        </label>
                        <Select
                          value={createdYear}
                          onValueChange={setCreatedYear}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Min Attendance %
                        </label>
                        <div className="flex h-8 items-center gap-1 overflow-auto rounded-md border border-border/70 bg-background px-1">
                          {attendanceLevels.map((percent) => (
                            <button
                              key={percent}
                              type="button"
                              onClick={() => setAttendancePercent(percent)}
                              className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
                                attendancePercent === percent
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {percent}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {sem && <Badge variant="outline">Sem {sem}</Badge>}
                    {dept && <Badge variant="outline">{dept}</Badge>}
                    <Badge variant="outline">
                      {getAcademicYearLabel(Number(createdYear))}
                    </Badge>
                    <Badge variant="secondary">Min {attendancePercent}%</Badge>
                    {loadingCommunity && (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                  </div>

                  {!canBrowseCommunity && (
                    <Card className="border-border/70 bg-background/70 shadow-none">
                      <CardContent className="p-3 text-xs text-muted-foreground">
                        Select semester and branch to load community timetables.
                      </CardContent>
                    </Card>
                  )}

                  {canBrowseCommunity &&
                    loadingCommunity &&
                    !communityRows.length && (
                      <Card className="border-border/70 bg-background/70 shadow-none">
                        <CardContent className="p-3 text-xs text-muted-foreground">
                          Loading community timetables...
                        </CardContent>
                      </Card>
                    )}

                  {canBrowseCommunity &&
                    !loadingCommunity &&
                    communityRows.length === 0 && (
                      <Card className="border-border/70 bg-background/70 shadow-none">
                        <CardContent className="p-3 text-xs text-muted-foreground">
                          No community timetable found for this combination.
                        </CardContent>
                      </Card>
                    )}

                  {!!communityRows.length && (
                    <Card className="border-border/70 bg-background/70 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Community Timetables
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Best scored timetables appear first.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {communityRows.map((row, index) => {
                          const myVote = myVotes[row._id] ?? 0;

                          return (
                            <div
                              key={row._id}
                              className="rounded-xl border border-border/70 bg-card p-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold leading-tight">
                                    {row.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {row.branch} - Sem {row.semester} - Sec{" "}
                                    {row.section} -{" "}
                                    {getAcademicYearLabel(
                                      Number(row.createdYear),
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {index === 0 && <Badge>Best</Badge>}
                                  <Badge variant="secondary">
                                    {row.voteScore || 0}
                                  </Badge>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-8 px-2.5"
                                  variant={myVote === 1 ? "default" : "outline"}
                                  onClick={() => handleVote(row._id, 1)}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                  {row.upvoteCount || 0}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-2.5"
                                  variant={
                                    myVote === -1 ? "default" : "outline"
                                  }
                                  onClick={() => handleVote(row._id, -1)}
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                  {row.downvoteCount || 0}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-2.5"
                                  variant="outline"
                                  onClick={() => handleReport(row._id)}
                                >
                                  <Flag className="h-3.5 w-3.5" />
                                  Report
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-2.5"
                                  variant="outline"
                                  onClick={() => openCommunityPreview(row)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View & Import
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <motion.div key="create" {...modeMotion}>
                  <Card className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:p-7">
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
                        <WandSparkles className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold sm:text-lg">
                          Build a custom timetable
                        </h3>
                      </div>
                      <Button onClick={() => onCreateClick(true)}>
                        Start Creating
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="grid h-[92vh] w-[calc(100vw-1rem)] max-w-5xl grid-rows-[auto_1fr] overflow-hidden p-0 sm:h-[90vh] sm:w-full">
          <DialogHeader className="border-b border-border/70 bg-muted/40 px-4 py-3 sm:px-5 sm:py-4">
            <DialogTitle className="text-base sm:text-lg">
              {selectedCommunity?.title || "Timetable Preview"}
            </DialogTitle>
            <DialogDescription>
              {selectedCommunity?.branch && selectedCommunity?.semester
                ? `${selectedCommunity.branch} • Sem ${selectedCommunity.semester} • Sec ${selectedCommunity.section || "-"} • ${getAcademicYearLabel(Number(selectedCommunity.createdYear))}`
                : "Preview community timetable and import it directly."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">
                Score {selectedCommunity?.voteScore || 0}
              </Badge>
              <Badge variant="outline">
                Up {selectedCommunity?.upvoteCount || 0}
              </Badge>
              <Badge variant="outline">
                Down {selectedCommunity?.downvoteCount || 0}
              </Badge>
              <Badge variant="outline">
                Imports {selectedCommunity?.importCount || 0}
              </Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Course Start
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {formatDateLabel(previewDates.courseStart)}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Course End
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {formatDateLabel(previewDates.courseEnd)}
                </p>
              </div>
            </div>

            {loadingPreview ? (
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                Loading timetable structure...
              </div>
            ) : selectedCommunity?.timeTable ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-card p-3">
                  <p className="text-xs font-medium">Courses</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedCommunity.timeTable.courses?.map((course) => (
                      <Badge
                        key={course.name}
                        variant="outline"
                        className="text-[11px]"
                      >
                        {course.name} ({course.type})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border/70 bg-background/40 pb-2 touch-pan-x [scrollbar-color:hsl(var(--muted-foreground)/0.4)_transparent] [scrollbar-width:thin]">
                  <div
                    className="grid w-max min-w-[640px] gap-0.5 rounded-xl bg-border p-0.5"
                    style={{
                      gridTemplateColumns: "auto repeat(5, minmax(110px, 1fr))",
                    }}
                  >
                    <div className="sticky left-0 top-0 z-40 flex min-h-[46px] items-center justify-center rounded-[10px] border-r border-border/50 bg-background px-2 py-2 text-sm font-semibold" />
                    {previewDays.map((day) => (
                      <div
                        key={day}
                        className="sticky top-0 z-30 flex min-h-[46px] items-center justify-center rounded-[10px] bg-background px-2 py-2 text-center text-xs font-semibold shadow-[0_1px_0_0_hsl(var(--border))] sm:text-sm"
                      >
                        {day}
                      </div>
                    ))}

                    {(selectedCommunity.timeTable?.timeSlots || [])
                      .filter(
                        (slot) =>
                          !String(slot.slotId || "")
                            .toLowerCase()
                            .includes("break"),
                      )
                      .map((slot) => (
                        <div
                          key={`preview-row-${slot.slotId}`}
                          className="contents"
                        >
                          <div
                            key={`slot-${slot.slotId}`}
                            className="sticky left-0 z-20 flex min-h-[54px] items-center justify-center rounded-[10px] border-r border-border/50 bg-background px-2 py-2 text-center text-[11px] leading-tight text-foreground shadow-[1px_0_0_0_hsl(var(--border))] sm:text-xs"
                          >
                            {slot.display}
                          </div>

                          {previewDays.map((_, dayIndex) => {
                            const event =
                              selectedCommunity.timeTable?.events?.find(
                                (item) =>
                                  item.slotId === slot.slotId &&
                                  item.dayIndex === dayIndex,
                              );
                            const course = event
                              ? selectedCommunity.timeTable?.courses?.find(
                                  (c) => c.name === event.courseId,
                                )
                              : null;

                            return (
                              <div
                                key={`${slot.slotId}-${dayIndex}`}
                                className="flex min-h-[54px] items-center rounded-[10px] bg-background px-2 py-2"
                              >
                                {event && course ? (
                                  <div className="w-full rounded-md border border-primary/20 bg-secondary px-2 py-1.5">
                                    <p className="truncate text-[11px] font-semibold sm:text-xs">
                                      {course.name}
                                    </p>
                                    <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                                      {course.instructor || "TBD"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="mx-auto text-[10px] text-muted-foreground sm:text-[11px]">
                                    -
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={handleModifyThenImport}
                  >
                    Modify Then Import
                  </Button>
                  <Button
                    className="h-9"
                    onClick={() => handleImportCommunity(selectedCommunity._id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Importing..." : "Import Timetable"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                No timetable details available for preview.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

ImportTimeTable.propTypes = {
  onCreateClick: PropTypes.func.isRequired,
  setActiveComponent: PropTypes.func.isRequired,
  setHasTimeTable: PropTypes.func.isRequired,
};

export default ImportTimeTable;
