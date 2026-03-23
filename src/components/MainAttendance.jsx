import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import d from "date-and-time";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import timeSlots from "../data/timeSlots.json";
import WaveLoader from "./Loading";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  PlusCircle,
  X,
  Check,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import SemesterCompletionCard from "./SemesterCompletionCard";
import { useBottomBarVisibility } from "../hooks/useBottomBarVisibility";
import { Button } from "./ui/button";

const panelVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 24, stiffness: 240 },
  },
  exit: { opacity: 0, y: 18, scale: 0.98, transition: { duration: 0.18 } },
};

const overlayVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 16 },
  },
};

const fieldClassName =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

const textareaClassName =
  "min-h-[110px] w-full rounded-xl border border-border/70 bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

const getAttendanceCardClassName = (attendance, selected) =>
  cn(
    "relative flex min-h-[92px] w-full flex-col rounded-2xl border p-2.5 sm:p-3 text-left shadow-sm transition-all duration-200",
    attendance === "present" &&
      "border-emerald-400/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
    attendance === "absent" &&
      "border-rose-400/35 bg-rose-500/10 text-rose-950 dark:text-rose-100",
    attendance === "ignore" &&
      "border-slate-400/30 bg-slate-500/10 opacity-70 text-slate-700 dark:text-slate-200",
    attendance === "pending" && "border-border/70 bg-card text-foreground",
    selected && "ring-2 ring-primary/30 shadow-lg shadow-primary/10",
    !selected && "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg",
  );

const getAttendancePillClassName = (percentage, minAttendance) => {
  if (percentage >= minAttendance) {
    return "border-emerald-500/30 bg-emerald-500 text-white";
  }

  if (percentage >= minAttendance - 10) {
    return "border-amber-500/30 bg-amber-500 text-white";
  }

  return "border-rose-500/30 bg-rose-500 text-white";
};

const AttendanceModalPortal = ({ children }) => {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
};

const MainAttendance = ({ setActiveComponent }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();

  const [accStart, setAccStart] = useState();
  const [accEnd, setAccEnd] = useState();
  const [date, setDate] = useState(new Date(now));
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState(null);
  const [dayCache, setDayCache] = useState([]);
  const [day, setDay] = useState([]);
  const [showDay, setShowDay] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [subjectAdd, setSubjectAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceState, setAttendanceState] = useState([]);
  const [overallAttendance, setOverallAttendance] = useState({});
  const [newSubject, setNewSubject] = useState({
    courseId: "",
    startTime: "09:00",
    endTime: "10:00",
    attendance: "pending",
  });
  const [description, setDescription] = useState("");
  const jumpMenuRef = useRef(null);
  const calendarRef = useRef(null);
  const [semEnd, setSemEnd] = useState(false);

  useBottomBarVisibility(showDay, "day-popup");
  useBottomBarVisibility(showCalendar, "calendar-popup");
  useBottomBarVisibility(subjectAdd, "subject-add-modal");
  useBottomBarVisibility(!!subject, "subject-detail-panel");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jumpMenuRef.current && !jumpMenuRef.current.contains(event.target)) {
        setShowJump(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    if (subjectAdd) {
      if (showDay) setShowDay(false);
      if (subject) setSubject(null);
      return;
    }

    if (subject && showDay) {
      setShowDay(false);
    }
  }, [isMobile, subjectAdd, subject, showDay]);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      if (isLoading || !isAuthenticated || !date) return;

      setLoading(true);
      try {
        await handleDayInit();
        if (isMounted) {
          await handleAttendanceState();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [isLoading, isAuthenticated, date]);

  const handlePrev = () => {
    const selectedDate = new Date(date);
    const accStartDate = new Date(accStart);

    selectedDate.setHours(0, 0, 0, 0);
    accStartDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() > accStartDate.getTime()) {
      setLoading(true);
      setDate((prev) => {
        const newDate = new Date(prev.valueOf() - 24 * 60 * 60 * 1000);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      });
    }
  };

  const formatMinutesFromMidnight = (minutesFromMidnight) => {
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;
    const time = new Date(0, 0, 0, hours, minutes);
    return d.format(time, "hh:mm");
  };

  const handleForw = () => {
    const selectedDate = new Date(date);
    const nowDate = new Date(now);

    selectedDate.setHours(0, 0, 0, 0);
    nowDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() < nowDate.getTime()) {
      setLoading(true);
      setDate((prev) => {
        const newDate = new Date(prev.valueOf() + 24 * 60 * 60 * 1000);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      });
    }
  };

  const handleSubjectSelect = (id) => {
    setShowDay(false);
    setSubjectAdd(false);

    if (subject && subject.slotId === id) {
      setSubject(null);
      setDay(JSON.parse(JSON.stringify(dayCache)));
    } else {
      const selectedSubject = day.find((ele) => ele.slotId === id);
      setSubject(selectedSubject);
      setDescription(selectedSubject.description || "");
    }
  };

  const handleAttendanceState = async () => {
    try {
      if (!isLoading && isAuthenticated) {
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/attendance/statistics?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.data.data.success) {
          setAttendanceState(res.data.data.attendanceState);
          setOverallAttendance(res.data.data.overallAttendanceState);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update attendance state. Please try again.");
      return false;
    }
  };

  const handleDayInit = async () => {
    setSubject(null);
    setSubjectAdd(false);
    setShowDay(false);

    try {
      if (!isLoading && isAuthenticated) {
        const token = await getAccessTokenSilently();
        const formattedDate = d.format(date, "YYYY-MM-DD");

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/attendance/init`,
          {
            user: {
              email: user.email,
              date: formattedDate,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.data.response.success) {
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          const accEndDate = new Date(res.data.response.accEnd);
          accEndDate.setHours(0, 0, 0, 0);
          if (selectedDate > accEndDate) {
            setSemEnd(true);
            return false;
          }
          setCourses([...res.data.response.courses]);
          setAccStart(new Date(res.data.response.accStart));
          setAccEnd(new Date(res.data.response.accEnd));
          const initialData = JSON.parse(res.data.response.dayTable);
          setDayCache(JSON.parse(JSON.stringify(initialData)));
          setDay(JSON.parse(JSON.stringify(initialData)));
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance data. Please try again.");
      return false;
    }
  };

  const handleSubjectDelete = async () => {
    try {
      if (!isLoading && isAuthenticated && subject.custom) {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URL}/attendance/add?email=${user.email}&date=${date.toDateString()}&slotId=${subject.slotId}&courseId=${subject.courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.success) {
          const newDayData = [...res.data.daySchedule];
          setDay(newDayData);
          setDayCache(JSON.parse(JSON.stringify(newDayData)));
          toast.success("Subject deleted successfully!");
          setSubject(null);
        } else {
          toast.error("Failed to delete subject.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subject. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveAttendanceState = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const formattedDate = d.format(date, "YYYY-MM-DD");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/save`,
        {
          user: {
            email: user.email,
            date: formattedDate,
          },
          daySchedule: day,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      handleAttendanceState();
      if (res.data.success) {
        const savedData = JSON.parse(JSON.stringify(res.data.daySchedule));
        setDay(savedData);
        setDayCache(JSON.parse(JSON.stringify(savedData)));
        setSubject(null);
        setShowDay(false);
        setSubjectAdd(false);
        toast.success("Attendance saved successfully!");
      } else {
        toast.error("Failed to save attendance. ");
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast.error("Failed to save attendance. Please try again.");
      setDay(JSON.parse(JSON.stringify(dayCache)));
    } finally {
      setLoading(false);
    }
  };

  const addCustomSubject = async () => {
    const startTime = newSubject.startTime;
    const endTime = newSubject.endTime;

    const startParts = startTime.split(":");
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

    const endParts = endTime.split(":");
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    const slotId = `custom-${startMinutes}-${endMinutes}`;

    const newEvent = {
      day: d.format(date, "ddd").toString().toUpperCase(),
      dayIndex: date.getDay() === 0 ? 6 : date.getDay() - 1,
      courseId: newSubject.courseId,
      slotId,
      duration: Math.ceil((endMinutes - startMinutes) / 60),
      attendance: "pending",
      display: `${newSubject.startTime} - ${newSubject.endTime}`,
      custom: true,
    };

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const formattedDate = d.format(date, "YYYY-MM-DD");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/add`,
        {
          user: {
            email: user.email,
            date: formattedDate,
          },
          subject: newEvent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data.success) {
        const updatedDay = [...day, res.data.subject];
        setDay(updatedDay);
        setDayCache(JSON.parse(JSON.stringify(updatedDay)));
        toast.success("Subject added successfully!");
        setSubjectAdd(false);
      } else {
        toast.error("Failed to add subject.");
      }
    } catch (err) {
      console.error("Error Adding Subject:", err);
      toast.error("Failed to add subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleForw(),
    onSwipedRight: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  const pendingCourses = useMemo(
    () => attendanceState.filter((course) => course.pending > 0),
    [attendanceState],
  );

  const dayStats = useMemo(() => {
    return {
      total: day.length,
      present: day.filter((item) => item.attendance === "present").length,
      absent: day.filter((item) => item.attendance === "absent").length,
      ignored: day.filter((item) => item.attendance === "ignore").length,
      pending: day.filter((item) => item.attendance === "pending").length,
    };
  }, [day]);

  const closeSubjectPanel = () => {
    setDay(JSON.parse(JSON.stringify(dayCache)));
    setSubject(null);
  };

  const closeDayPanel = () => {
    setDay(JSON.parse(JSON.stringify(dayCache)));
    setShowDay(false);
  };

  const openAddClass = () => {
    setSubject(null);
    setShowDay(false);
    setSubjectAdd(true);
    setNewSubject({
      courseId: courses[0]?.name || "",
      startTime: "09:00",
      endTime: "10:00",
      attendance: "pending",
    });
  };

  const openDayEditor = () => {
    setShowDay(true);
    setSubject(null);
    setSubjectAdd(false);
    setDescription(day[0]?.description || "");
  };

  const renderModalShell = (content, onClose, mobile = false) => (
    <AttendanceModalPortal>
      <motion.div
        className={cn(
          "fixed inset-0 z-[140] flex bg-black/60 backdrop-blur-[2px]",
          mobile
            ? "items-end justify-stretch"
            : "items-center justify-center p-3 sm:p-4",
        )}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalBackdropVariants}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          className={cn(
            mobile
              ? "max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-border/70 bg-background p-4 shadow-2xl"
              : "w-full max-w-2xl overflow-y-auto rounded-[28px] border border-border/70 bg-card p-5 shadow-2xl sm:p-6",
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          onClick={(event) => event.stopPropagation()}
        >
          {content}
        </motion.div>
      </motion.div>
    </AttendanceModalPortal>
  );

  const renderSectionHeader = (title, onClose) => (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and update attendance details before saving.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  const renderAddSubjectContent = (mobile = false) => {
    if (!newSubject) return null;

    return (
      <div className="space-y-5">
        {renderSectionHeader("Add Custom Class", () => setSubjectAdd(false))}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Course</label>
          <select
            className={fieldClassName}
            value={newSubject.courseId}
            onChange={(e) =>
              setNewSubject({
                ...newSubject,
                courseId: e.target.value,
              })
            }
          >
            {courses.map((course) => (
              <option key={course.name} value={course.name}>
                {course.name} - {course.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Time Range
          </label>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <input
              type="time"
              className={fieldClassName}
              value={newSubject.startTime}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  startTime: e.target.value,
                })
              }
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="time"
              className={fieldClassName}
              value={newSubject.endTime}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  endTime: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className={cn("flex gap-3", mobile ? "pb-2" : "pt-2")}>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setSubjectAdd(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={addCustomSubject}>
            Add Class
          </Button>
        </div>
      </div>
    );
  };

  const renderSubjectContent = (mobile = false) => {
    if (!subject) return null;

    return (
      <div className="space-y-5">
        {renderSectionHeader("Edit Attendance", closeSubjectPanel)}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Course</label>
          <select
            className={fieldClassName}
            value={subject.courseId}
            onChange={(e) => {
              setSubject((prev) => ({
                ...prev,
                courseId: e.target.value,
              }));

              setDay((prev) => {
                prev.forEach((ele) => {
                  if (ele.slotId === subject.slotId) {
                    ele.courseId = e.target.value;
                  }
                });
                return [...prev];
              });
            }}
          >
            {courses.map((course) => (
              <option key={course.name} value={course.name}>
                {course.name} - {course.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Time</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {subject.display}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={subject.attendance === "ignore"}
            onChange={(e) => {
              setDay((prev) =>
                prev.map((item) => {
                  if (item.slotId === subject.slotId) {
                    return {
                      ...item,
                      attendance: e.target.checked ? "ignore" : "pending",
                    };
                  }
                  return item;
                }),
              );

              setSubject((prev) => ({
                ...prev,
                attendance: e.target.checked ? "ignore" : "pending",
              }));
            }}
          />
          Ignore this class (holiday, cancelled, etc.)
        </label>

        {subject.custom && (
          <button
            type="button"
            onClick={handleSubjectDelete}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete this class
          </button>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Attendance Status
          </label>
          <div
            className={cn(
              "grid gap-3",
              mobile ? "grid-cols-1 pb-2" : "grid-cols-2",
            )}
          >
            <button
              type="button"
              disabled={subject.attendance === "ignore"}
              onClick={() => {
                if (subject.attendance !== "ignore") {
                  setDay((prev) =>
                    prev.map((item) => {
                      if (item.slotId === subject.slotId) {
                        return {
                          ...item,
                          attendance: "present",
                        };
                      }
                      return item;
                    }),
                  );

                  setSubject((prev) => ({
                    ...prev,
                    attendance: "present",
                  }));
                }
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-200"
            >
              <Check className="h-4 w-4" />
              Present
            </button>

            <button
              type="button"
              disabled={subject.attendance === "ignore"}
              onClick={() => {
                if (subject.attendance !== "ignore") {
                  setDay((prev) =>
                    prev.map((item) => {
                      if (item.slotId === subject.slotId) {
                        return {
                          ...item,
                          attendance: "absent",
                        };
                      }
                      return item;
                    }),
                  );

                  setSubject((prev) => ({
                    ...prev,
                    attendance: "absent",
                  }));
                }
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-200"
            >
              <X className="h-4 w-4" />
              Absent
            </button>
          </div>
        </div>

        {(subject.attendance === "ignore" ||
          subject.attendance === "absent") && (
          <div className={cn("space-y-2", mobile && "pb-2")}>
            <label className="text-sm font-medium text-foreground">
              Reason
            </label>
            <textarea
              className={textareaClassName}
              value={description}
              onChange={(e) => {
                if (!(e.target.value.length > 100)) {
                  setDescription(e.target.value);
                  setDay((prev) =>
                    prev.map((item) => {
                      if (item.slotId === subject.slotId) {
                        return {
                          ...item,
                          description: e.target.value,
                        };
                      }
                      return item;
                    }),
                  );
                } else {
                  toast.info("Reason exceeded 100 characters");
                }
              }}
              placeholder="Add reason for this class..."
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={closeSubjectPanel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              saveAttendanceState();
              setSubject(null);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const renderDayContent = (mobile = false) => (
    <div className="space-y-5">
      {renderSectionHeader("Entire Day Attendance", closeDayPanel)}

      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">Date</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          {d.format(date, "dddd, MMMM DD, YYYY")}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Set All Classes
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-foreground">
          <input
            checked={day.every((ele) => ele.attendance === "ignore")}
            type="checkbox"
            className="h-4 w-4 accent-primary"
            onClick={(e) => {
              if (e.target.checked) {
                setDay((prev) =>
                  prev.map((item) => ({ ...item, attendance: "ignore" })),
                );
              } else {
                setDay((prev) =>
                  prev.map((item) => ({ ...item, attendance: "pending" })),
                );
              }
            }}
          />
          Ignore this day (holiday, cancelled, etc.)
        </label>

        <div
          className={cn(
            "grid gap-3",
            mobile ? "grid-cols-1 pb-2" : "grid-cols-2",
          )}
        >
          <button
            type="button"
            onClick={() => {
              setDay((prev) =>
                prev.map((item) => {
                  if (item.attendance !== "ignore") {
                    return {
                      ...item,
                      attendance: "present",
                    };
                  }
                  return item;
                }),
              );
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-500/15 dark:text-emerald-200"
          >
            <Check className="h-4 w-4" />
            All Present
          </button>

          <button
            type="button"
            onClick={() => {
              setDay((prev) =>
                prev.map((item) => {
                  if (item.attendance !== "ignore") {
                    return {
                      ...item,
                      attendance: "absent",
                    };
                  }
                  return item;
                }),
              );
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-500/15 dark:text-rose-200"
          >
            <X className="h-4 w-4" />
            All Absent
          </button>
        </div>
      </div>

      {(day.filter((ele) => ele.attendance === "absent").length ===
        day.length ||
        day.filter((ele) => ele.attendance === "ignore").length ===
          day.length) && (
        <div className={cn("space-y-2", mobile && "pb-2")}>
          <label className="text-sm font-medium text-foreground">Reason</label>
          <textarea
            className={textareaClassName}
            value={description}
            onChange={(e) => {
              if (!(e.target.value.length > 100)) {
                setDescription(e.target.value);
                setDay((prev) =>
                  prev.map((item) => ({
                    ...item,
                    description: e.target.value,
                  })),
                );
              } else {
                toast.info("Reason exceeded 100 characters");
              }
            }}
            placeholder="Add reason for this day..."
            maxLength={100}
          />
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1" onClick={closeDayPanel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            saveAttendanceState();
            setShowDay(false);
          }}
        >
          Save Day
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-[26px] border border-border/70 bg-card/95 p-3 shadow-sm sm:p-4 lg:p-5"
      onClick={() => {
        setShowJump(false);
        setShowCalendar(false);
        if (subject) {
          setSubject(null);
        }
        if (showDay) {
          setShowDay(false);
        }
        if (subjectAdd) {
          setSubjectAdd(false);
        }
      }}
    >
      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-border/70 bg-muted/25">
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </div>
      ) : semEnd ? (
        <SemesterCompletionCard
          overallAttendance={overallAttendance}
          setActiveComponent={setActiveComponent}
        />
      ) : (
        <>
          <div className="relative overflow-visible rounded-2xl border border-border/70 bg-muted/35 p-2.5 shadow-sm sm:rounded-[24px] sm:p-4">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70 sm:text-[11px] sm:tracking-[0.22em]">
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Daily Attendance
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={
                      new Date(date)?.getTime() <= new Date(accStart)?.getTime()
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-primary transition hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground sm:h-10 sm:w-10"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <div>
                    <p className="text-sm font-semibold text-foreground sm:text-2xl">
                      {d.format(date, "ddd, MMM DD YYYY")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleForw}
                    disabled={
                      new Date(date)?.setHours(0, 0, 0, 0) >=
                        new Date(now).setHours(0, 0, 0, 0) &&
                      new Date(date)?.getTime() <= new Date(accEnd).getTime()
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-primary transition hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground sm:h-10 sm:w-10"
                  >
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowJump((prev) => !prev);
                    setShowCalendar(false);
                  }}
                  className="h-8 gap-1.5 px-2.5 text-xs sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Jump To
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  ref={calendarRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={overlayVariants}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute right-0 top-full z-40 mt-3 w-[min(92vw,22rem)] rounded-3xl border border-border/70 bg-card p-4 shadow-2xl"
                >
                  <Calendar
                    className="shadcn-calendar"
                    minDate={new Date(accStart)}
                    maxDate={new Date(new Date().getTime())}
                    value={date}
                    onChange={(value) => {
                      setDate(new Date(new Date(value).getTime() + istOffset));
                      setShowCalendar(false);
                    }}
                  />
                </motion.div>
              )}

              {showJump && (
                <motion.div
                  ref={jumpMenuRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={overlayVariants}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute right-0 top-full z-40 mt-3 w-[min(92vw,18rem)] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalendar(true);
                      setShowJump(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-accent"
                  >
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Select on Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDate(new Date(now));
                      setShowJump(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-accent"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDate(new Date(accStart));
                      setShowJump(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-accent"
                  >
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Academic Start
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {pendingCourses.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const courseWithPending = pendingCourses[0];
                const firstPendingSlot = day.find(
                  (slot) => slot.courseId === courseWithPending.courseId,
                );

                if (firstPendingSlot) {
                  handleSubjectSelect(firstPendingSlot.slotId);
                }
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-left text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-500/15 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4" />
              You have pending attendance to mark
            </button>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-4">
                {[
                  {
                    label: "Pending",
                    value: dayStats.pending,
                    className:
                      "border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-200",
                  },
                  {
                    label: "Present",
                    value: dayStats.present,
                    className:
                      "border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
                  },
                  {
                    label: "Absent",
                    value: dayStats.absent,
                    className:
                      "border-rose-400/35 bg-rose-500/10 text-rose-700 dark:text-rose-200",
                  },
                  {
                    label: "Ignored",
                    value: dayStats.ignored,
                    className:
                      "border-slate-400/35 bg-slate-500/10 text-slate-700 dark:text-slate-200",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "rounded-xl border p-2 shadow-sm sm:rounded-2xl sm:p-3",
                      item.className,
                    )}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] sm:text-[11px] sm:tracking-[0.16em]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-none sm:mt-2 sm:text-2xl">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <motion.div
                {...swipeHandlers}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2 lg:grid-cols-3 2xl:grid-cols-4"
              >
                {day && day.length > 0 ? (
                  day.map((ele) => {
                    const courseData = attendanceState.find(
                      (course) => course.courseId === ele.courseId,
                    );
                    const courseMeta = courses.find(
                      (course) => course.name === ele.courseId,
                    );
                    const courseDisplayName =
                      courseMeta?.fullName?.trim() || ele.courseId;
                    const hasPending = courseData && courseData.pending > 0;
                    const attendancePercent = courseData
                      ? courseData.attendancePercentage
                      : 0;
                    const minAttendance = courseData
                      ? courseData.minAttendance
                      : 85;

                    return (
                      <motion.button
                        key={ele.slotId}
                        type="button"
                        variants={staggerItem}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.985 }}
                        className={getAttendanceCardClassName(
                          ele.attendance,
                          subject && subject.slotId === ele.slotId,
                        )}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSubjectSelect(ele.slotId);
                        }}
                      >
                        {courseData && (
                          <div
                            className={cn(
                              "absolute -right-2 -top-2 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-sm",
                              getAttendancePillClassName(
                                attendancePercent,
                                minAttendance,
                              ),
                            )}
                          >
                            {attendancePercent}%
                          </div>
                        )}

                        {hasPending && (
                          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-amber-500 shadow-sm" />
                        )}

                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {!ele.custom
                              ? (() => {
                                  const slot = timeSlots.find(
                                    (item) => item.slotId === ele.slotId,
                                  );
                                  const start = slot.start;
                                  const end =
                                    ele.duration === 1
                                      ? slot.end
                                      : slot.end + 60;
                                  return `${formatMinutesFromMidnight(start)} - ${formatMinutesFromMidnight(end)}`;
                                })()
                              : ele.display}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-1 flex-col justify-between">
                          <div>
                            <p
                              className="truncate text-sm font-semibold tracking-tight text-foreground"
                              title={courseDisplayName}
                            >
                              {courseDisplayName}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {ele.custom
                                ? `Custom${ele.courseId ? ` • ${ele.courseId}` : ""}`
                                : ele.courseId}
                            </p>
                          </div>

                          <div className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {ele.attendance === "present" && (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                Present
                              </>
                            )}
                            {ele.attendance === "absent" && (
                              <>
                                <X className="h-3 w-3 text-rose-500" />
                                Absent
                              </>
                            )}
                            {ele.attendance === "ignore" && (
                              <>
                                <AlertTriangle className="h-3 w-3 text-slate-500" />
                                Ignored
                              </>
                            )}
                            {ele.attendance === "pending" && (
                              <>
                                <Clock className="h-3 w-3 text-amber-500" />
                                Pending
                              </>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <motion.div
                    variants={staggerItem}
                    className="col-span-full rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No classes scheduled for this day.
                  </motion.div>
                )}
              </motion.div>
            </div>

            <aside className="h-fit rounded-2xl border border-border/70 bg-muted/25 p-3 shadow-sm sm:rounded-[24px] sm:p-4 xl:sticky xl:top-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70 sm:text-[11px] sm:tracking-[0.18em]">
                Quick Actions
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-foreground sm:mt-2 sm:text-lg">
                Keep today updated
              </h3>

              <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-3">
                <Button
                  className={cn(
                    "h-9 w-full justify-start gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
                    day.length === 0 && "pointer-events-none opacity-45",
                  )}
                  disabled={day.length === 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    openDayEditor();
                  }}
                >
                  <Check className="h-4 w-4" />
                  Select Entire Day
                </Button>

                <Button
                  variant="outline"
                  className="h-9 w-full justify-start gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    openAddClass();
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Class
                </Button>
              </div>

              <div className="mt-3 rounded-xl border border-border/70 bg-background/70 p-2.5 sm:mt-5 sm:rounded-2xl sm:p-4">
                <p className="text-xs font-medium text-foreground sm:text-sm">
                  Need attention
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground sm:mt-3 sm:space-y-2 sm:text-sm">
                  <li>
                    {pendingCourses.length} subjects still have pending entries
                  </li>
                  <li>Tap a class card to update attendance</li>
                </ul>
              </div>
            </aside>
          </div>

          <AnimatePresence mode="wait">
            {subjectAdd &&
              newSubject &&
              !isMobile &&
              renderModalShell(
                renderAddSubjectContent(false),
                () => setSubjectAdd(false),
                false,
              )}
            {subject &&
              !isMobile &&
              renderModalShell(
                renderSubjectContent(false),
                closeSubjectPanel,
                false,
              )}
            {showDay &&
              !isMobile &&
              renderModalShell(renderDayContent(false), closeDayPanel, false)}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {subjectAdd &&
              newSubject &&
              isMobile &&
              renderModalShell(
                renderAddSubjectContent(true),
                () => setSubjectAdd(false),
                true,
              )}
            {subject &&
              isMobile &&
              renderModalShell(
                renderSubjectContent(true),
                closeSubjectPanel,
                true,
              )}
            {showDay &&
              isMobile &&
              renderModalShell(renderDayContent(true), closeDayPanel, true)}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default MainAttendance;
