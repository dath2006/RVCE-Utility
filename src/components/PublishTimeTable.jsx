import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { AlertTriangle, Download, TrendingUp, UploadCloud } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
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

const semesterOptions = Array.from({ length: 8 }, (_, index) => {
  const value = String(index + 1);
  return {
    value,
    label: `${value}${value === "1" ? "st" : value === "2" ? "nd" : value === "3" ? "rd" : "th"} Semester`,
  };
});

const allDepartments = [
  { code: "AI", name: "Artificial Intelligence" },
  { code: "AS", name: "Aerospace Engineering" },
  { code: "BT", name: "Biotechnology" },
  { code: "CD", name: "Data Science" },
  { code: "CH", name: "Chemical Engineering" },
  { code: "CS", name: "Computer Science" },
  { code: "CV", name: "Civil Engineering" },
  { code: "CY", name: "Cyber Security" },
  { code: "EC", name: "Electronics & Communication" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "ET", name: "Electronics & Telecommunication" },
  { code: "IM", name: "Industrial Management" },
  { code: "ME", name: "Mechanical Engineering" },
];

const getAcademicStartYear = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

const getAcademicYearLabel = (startYear) => {
  const suffix = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${suffix}`;
};

const formatAcademicYear = (startYear) => {
  const numeric = Number(startYear);
  if (!numeric) {
    return "-";
  }
  return getAcademicYearLabel(numeric);
};

const normalizeEntityId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    if (typeof value.$oid === "string") {
      return value.$oid.trim();
    }

    if (typeof value.id === "string") {
      return value.id.trim();
    }

    if (typeof value.toString === "function") {
      const asString = String(value.toString()).trim();
      if (asString && asString !== "[object Object]") {
        return asString;
      }
    }
  }

  return "";
};

const PublishTimeTable = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [createdYear, setCreatedYear] = useState(
    String(getAcademicStartYear()),
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loadingTimeTable, setLoadingTimeTable] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedRows, setPublishedRows] = useState([]);
  const [loadingPublishedRows, setLoadingPublishedRows] = useState(false);
  const yearOptions = [
    getAcademicStartYear() - 1,
    getAcademicStartYear(),
    getAcademicStartYear() + 1,
    getAcademicStartYear() + 2,
  ].map((year) => ({
    value: String(year),
    label: getAcademicYearLabel(year),
  }));

  useEffect(() => {
    const storedSem = localStorage.getItem("attendanceSem");
    const storedBranch = localStorage.getItem("attendanceBranch");
    const storedSection = localStorage.getItem("attendanceSection");
    const storedYear = localStorage.getItem("attendanceYear");

    if (storedSem) {
      setSemester(storedSem);
    }
    if (storedBranch) {
      setBranch(storedBranch);
    }
    if (storedSection) {
      setSection(storedSection);
    }
    if (storedYear) {
      setCreatedYear(storedYear);
    }
  }, []);

  const loadMyPublishedTimetables = async () => {
    if (isLoading || !isAuthenticated || !user?.email) {
      return;
    }

    try {
      setLoadingPublishedRows(true);
      const token = await getAccessTokenSilently();
      const params = new URLSearchParams({
        publishedByEmail: user.email,
        sortBy: "new",
        limit: "100",
      });

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/community/timetables?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPublishedRows(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load your published timetables.");
    } finally {
      setLoadingPublishedRows(false);
    }
  };

  useEffect(() => {
    const loadMyTimeTable = async () => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      try {
        setLoadingTimeTable(true);
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data?.timeTable) {
          setTimetable(res.data.timeTable);
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load your timetable for publishing.");
      } finally {
        setLoadingTimeTable(false);
      }
    };

    loadMyTimeTable();
  }, [getAccessTokenSilently, isAuthenticated, isLoading, user?.email]);

  useEffect(() => {
    loadMyPublishedTimetables();
  }, [getAccessTokenSilently, isAuthenticated, isLoading, user?.email]);

  const handlePublish = async () => {
    if (!timetable) {
      toast.error("No timetable found to publish.");
      return;
    }

    if (!semester || !branch || !section.trim()) {
      toast.error("Please fill semester, branch and section.");
      return;
    }

    try {
      setPublishing(true);
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/timetables`,
        {
          user: {
            email: user.email,
            name: user.name,
          },
          timeTable: {
            _id: timetable._id,
            timeSlots: timetable.timeSlots,
            courses: timetable.courses,
            events: timetable.events,
          },
          sourceTimeTableId: timetable._id,
          semester,
          branch: branch.trim().toUpperCase(),
          section: section.trim().toUpperCase(),
          createdYear: Number(createdYear),
          title: title.trim(),
          description: description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to publish timetable.");
        return;
      }

      toast.success("Timetable published to community.");
      setTitle("");
      setDescription("");
      await loadMyPublishedTimetables();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to publish timetable.",
      );
    } finally {
      setPublishing(false);
    }
  };

  const analytics = {
    totalPublished: publishedRows.length,
    totalImports: publishedRows.reduce(
      (sum, row) => sum + (row.importCount || 0),
      0,
    ),
    totalScore: publishedRows.reduce(
      (sum, row) => sum + (row.voteScore || 0),
      0,
    ),
    totalReports: publishedRows.reduce(
      (sum, row) => sum + (row.reportCount || 0),
      0,
    ),
  };

  const statCards = [
    {
      key: "published",
      label: "Published",
      value: analytics.totalPublished,
      icon: UploadCloud,
      tone: "border-sky-300/40 bg-sky-500/10 text-sky-700 dark:text-sky-200",
    },
    {
      key: "imports",
      label: "Total Imports",
      value: analytics.totalImports,
      icon: Download,
      tone: "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    },
    {
      key: "score",
      label: "Net Score",
      value: analytics.totalScore,
      icon: TrendingUp,
      tone: "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-200",
    },
    {
      key: "reports",
      label: "Reports",
      value: analytics.totalReports,
      icon: AlertTriangle,
      tone: "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200",
    },
  ];

  const currentTimeTableId = normalizeEntityId(timetable?._id);
  const alreadyPublishedCurrentTimetable =
    Boolean(currentTimeTableId) &&
    publishedRows.some(
      (row) => normalizeEntityId(row.sourceTimeTableId) === currentTimeTableId,
    );
  const isResolvingPublishState =
    isLoading || loadingTimeTable || loadingPublishedRows;

  return (
    <Card className="border-border/70 bg-background/70 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UploadCloud className="h-5 w-5" />
          Publish To Community
        </CardTitle>
        <CardDescription>
          Share your current timetable so others can import, vote, and improve
          from it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isResolvingPublishState ? (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              Checking publish status...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Loading your timetable and published entries.
            </p>
          </div>
        ) : alreadyPublishedCurrentTimetable ? (
          <div className="rounded-xl border border-amber-300/60 bg-amber-100/40 p-4 text-amber-900">
            <p className="text-sm font-semibold">Already Published</p>
            <p className="mt-1 text-sm">
              Your current timetable is already published to the community.
            </p>
            <p className="mt-2 text-xs text-amber-800/90">
              Create or import a new timetable to publish again.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select value={createdYear} onValueChange={setCreatedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDepartments.map((department) => (
                      <SelectItem key={department.code} value={department.code}>
                        {department.code} - {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Input
                  value={section}
                  onChange={(event) => setSection(event.target.value)}
                  placeholder="Example: A"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Title (optional)</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: CS 3rd Sem - Reliable"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add any context others should know"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              {loadingTimeTable
                ? "Loading your timetable..."
                : timetable
                  ? `Ready to publish: ${timetable.courses?.length || 0} courses, ${timetable.events?.length || 0} events`
                  : "No timetable available yet. Create or import one first."}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handlePublish}
                disabled={
                  publishing || loadingTimeTable || !timetable || isLoading
                }
              >
                {publishing ? "Publishing..." : "Publish Timetable"}
              </Button>
            </div>
          </>
        )}

        <div className="rounded-xl border border-border/70 bg-card/80 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">My Published Timetables</p>
            {loadingPublishedRows && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className={`rounded-xl border p-3 shadow-sm ${item.tone}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-90">
                      {item.label}
                    </p>
                    <Icon className="h-4 w-4 opacity-80" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold leading-none">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-2">
            {!loadingPublishedRows && publishedRows.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No published timetables yet.
              </p>
            )}

            {publishedRows.slice(0, 6).map((row) => (
              <div
                key={row._id}
                className="rounded-md border border-border/70 bg-background/70 px-2.5 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">
                    {row.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Score {row.voteScore || 0}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {row.branch} - Sem {row.semester} - Sec {row.section} -{" "}
                  {formatAcademicYear(row.createdYear)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-200">
                    Imports {row.importCount || 0}
                  </span>
                  <span className="rounded-full border border-sky-300/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-200">
                    Up {row.upvoteCount || 0}
                  </span>
                  <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-200">
                    Down {row.downvoteCount || 0}
                  </span>
                  <span className="rounded-full border border-rose-300/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-200">
                    Reports {row.reportCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishTimeTable;
