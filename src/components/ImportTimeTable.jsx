import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  GraduationCap,
  RefreshCcw,
  Sparkles,
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
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const modeMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const attendanceLevels = [75, 80, 85, 90, 95];

// Semester options
const semesterOptions = [
  { value: "1", label: "1st Semester" },
  { value: "3", label: "3rd Semester" },
];

// Department data based on semester
const departmentDataBySemester = {
  1: [
    { code: "AI", name: "Artificial Intelligence", sections: ["A", "B", "C"] },
    { code: "BT", name: "Biotechnology", sections: [] },
    {
      code: "CS",
      name: "Computer Science",
      sections: ["A", "B", "C", "D", "E", "F"],
    },
    { code: "CD", name: "Data Science", sections: [] },
    { code: "CY", name: "Cyber Security", sections: [] },
    {
      code: "EC",
      name: "Electronics & Communication",
      sections: ["A", "B", "C", "D"],
    },
    { code: "EE", name: "Electrical Engineering", sections: [] },
    { code: "ET", name: "Electronics & Telecommunication", sections: [] },
    { code: "AS", name: "Aerospace Engineering", sections: [] },
    { code: "CH", name: "Chemical Engineering", sections: [] },
    { code: "CV", name: "Civil Engineering", sections: [] },
    { code: "IM", name: "Industrial Management", sections: [] },
    { code: "ME", name: "Mechanical Engineering", sections: ["A", "B"] },
  ],
  3: [
    {
      code: "CS",
      name: "Computer Science",
      sections: ["A", "B", "C", "D", "E"],
    },
    { code: "CD", name: "Data Science", sections: [] },
    { code: "CY", name: "Cyber Security", sections: [] },
    {
      code: "EC",
      name: "Electronics & Communication",
      sections: ["A", "B", "C", "D"],
    },
    { code: "AS", name: "Aerospace Engineering", sections: [] },
  ],
};

const ImportTimeTable = ({
  onCreateClick,
  setActiveComponent,
  setHasTimeTable,
}) => {
  const [activeTab, setActiveTab] = useState("import");
  const [sem, setSem] = useState("");
  const [dept, setDept] = useState("");
  const [sect, setSect] = useState("");
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [selectedDept, setSelectedDept] = useState(null);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  useEffect(() => {
    if (sem) {
      setAvailableDepartments(departmentDataBySemester[sem] || []);
      setDept("");
      setSect("");
      setSelectedDept(null);
      return;
    }

    setAvailableDepartments([]);
  }, [sem]);

  useEffect(() => {
    if (activeTab !== "import") {
      setIsValid(true);
      return;
    }

    if (!sem || !dept) {
      setIsValid(false);
      return;
    }

    const deptInfo = availableDepartments.find((d) => d.code === dept);
    if (!deptInfo) {
      setIsValid(false);
      return;
    }

    setIsValid(deptInfo.sections.length > 0 ? sect !== "" : true);
  }, [sem, dept, sect, activeTab, availableDepartments]);

  const handleDeptChange = (selectedCode) => {
    setDept(selectedCode);
    setSect("");
    const deptInfo = availableDepartments.find((d) => d.code === selectedCode);
    setSelectedDept(deptInfo || null);
  };

  const resetImportForm = () => {
    setSem("");
    setDept("");
    setSect("");
    setAttendancePercent(85);
    setSelectedDept(null);
    setAvailableDepartments([]);
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    try {
      if (!isLoading && isAuthenticated) {
        setIsSubmitting(true);
        const token = await getAccessTokenSilently();
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/attendance/initialize`,
          {
            user: {
              fullName: user.name,
              email: user.email,
              imageUrl: user.picture,
              semester: sem,
              branch: dept,
              section: sect,
              courseStart:
                sem === "1" ? new Date("2025-09-08") : new Date("2025-09-29"),
              courseEnd:
                sem === "1" ? new Date("2025-12-12") : new Date("2026-01-31"),
              minAttendance: attendancePercent,
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

        setActiveComponent("main");
        setHasTimeTable(true);
        toast.success("Timetable imported successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to import timetable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <CardHeader className="border-b border-border/70 bg-muted/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <Badge
                  variant="secondary"
                  className="w-fit border border-border/70 bg-background/80 text-foreground hover:bg-background/80"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Attendance Setup
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl">
                  Schedule Onboarding
                </CardTitle>
                <CardDescription className="max-w-2xl">
                  Import a supported timetable or move into the custom builder.
                  Both flows now follow the same shadcn-style workspace language
                  used across the redesigned attendance area.
                </CardDescription>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-muted-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  id: "import",
                  title: "Import Existing",
                  description:
                    "Fast setup for supported semester and department combinations.",
                  icon: Download,
                },
                {
                  id: "create",
                  title: "Create Custom",
                  description:
                    "Build courses and timetable blocks manually from scratch.",
                  icon: WandSparkles,
                },
              ].map((option) => {
                const Icon = option.icon;
                const active = activeTab === option.id;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setActiveTab(option.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-border/70 bg-background hover:border-primary/20 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-xl p-2 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Separator />

            <AnimatePresence mode="wait">
              {activeTab === "import" ? (
                <motion.div key="import" {...modeMotion} className="space-y-6">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 bg-background/70 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg">Guided Import</CardTitle>
                        <CardDescription>
                          Pick your academic setup and we will initialize
                          attendance with the correct default date range.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium">
                            Semester
                          </label>
                          <Select value={sem} onValueChange={setSem}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
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

                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium">
                            Department
                          </label>
                          <Select
                            value={dept}
                            onValueChange={handleDeptChange}
                            disabled={!sem}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  sem
                                    ? "Select department"
                                    : "Choose semester first"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDepartments.map((department) => (
                                <SelectItem
                                  key={department.code}
                                  value={department.code}
                                >
                                  {department.code} - {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedDept?.sections?.length > 0 && (
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium">
                              Section
                            </label>
                            <Select value={sect} onValueChange={setSect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedDept.sections.map((section) => (
                                  <SelectItem key={section} value={section}>
                                    Section {section}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-background/70 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Attendance Rule
                        </CardTitle>
                        <CardDescription>
                          Set the default minimum percentage before attendance
                          starts tracking.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {attendanceLevels.map((percent) => (
                            <button
                              key={percent}
                              type="button"
                              onClick={() => setAttendancePercent(percent)}
                              className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                                attendancePercent === percent
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background hover:border-primary/30 hover:bg-accent"
                              }`}
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                          Imported timetable will use{" "}
                          <span className="font-semibold text-foreground">
                            {attendancePercent}%
                          </span>{" "}
                          as the default minimum attendance threshold.
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {sem && <Badge variant="outline">Semester {sem}</Badge>}
                    {dept && <Badge variant="outline">Department {dept}</Badge>}
                    {sect && <Badge variant="outline">Section {sect}</Badge>}
                    <Badge variant="secondary">
                      Minimum {attendancePercent}%
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={resetImportForm}
                      className="sm:min-w-32"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!isValid || isSubmitting}
                      className="sm:min-w-40"
                    >
                      {isSubmitting ? "Importing..." : "Import Timetable"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="create" {...modeMotion}>
                  <Card className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-10">
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
                        <WandSparkles className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                          Build a custom timetable
                        </h3>
                        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                          Create courses, configure attendance rules, and assign
                          timetable slots manually with the redesigned custom
                          builder.
                        </p>
                      </div>
                      <Button size="lg" onClick={() => onCreateClick(true)}>
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
    </div>
  );
};

ImportTimeTable.propTypes = {
  onCreateClick: PropTypes.func.isRequired,
  setActiveComponent: PropTypes.func.isRequired,
  setHasTimeTable: PropTypes.func.isRequired,
};

export default ImportTimeTable;
