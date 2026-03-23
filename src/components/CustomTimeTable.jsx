import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "react-calendar";
import { IconButton } from "@mui/material";
import {
  AddCircle,
  Delete,
  Edit,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";

import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useBottomBarVisibility } from "../hooks/useBottomBarVisibility";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input as UiInput } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Constants
const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI"];
const timeSlots = [
  { slotId: "slot1", display: "9.00 - 10.00", start: 540, end: 600 },
  { slotId: "slot2", display: "10.00 - 11.00", start: 600, end: 660 },
  {
    slotId: "break1",
    display: "Short Break",
    start: 660,
    end: 690,
    isBreak: true,
  },
  { slotId: "slot3", display: "11.30 - 12.30", start: 690, end: 750 },
  { slotId: "slot4", display: "12.30 - 01.30", start: 750, end: 810 },
  {
    slotId: "break2",
    display: "Lunch Break",
    start: 810,
    end: 870,
    isBreak: true,
  },
  { slotId: "slot5", display: "02.30 - 03.30", start: 870, end: 930 },
  { slotId: "slot6", display: "03.30 - 04.30", start: 930, end: 990 },
];

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const calendarSurfaceClassName =
  "shadcn-calendar rounded-xl border border-border/70 bg-card/80 p-3 sm:p-4";

// Shared card wrapper Tailwind class for all step panels
const stepCardCn =
  "bg-card rounded-[18px] shadow-[0_16px_40px_rgba(15,23,42,0.08)] px-4 pt-5 pb-3 sm:px-6 md:px-7 md:pt-7 md:pb-7 border border-border w-full max-w-5xl min-w-0 mx-auto flex flex-col overflow-y-auto min-h-[calc(100dvh-180px)] md:min-h-[calc(100dvh-140px)]";

// Simplify validation helper
const validateStep = (step, data) => {
  switch (step) {
    case 1: {
      const { semester, branch, courseStartDate, courseEndDate } = data;
      if (!semester)
        return { isValid: false, message: "Please select a semester" };
      if (!branch?.trim())
        return { isValid: false, message: "Please enter your branch" };
      if (!courseStartDate)
        return { isValid: false, message: "Please select a start date" };
      if (!courseEndDate)
        return { isValid: false, message: "Please select an end date" };
      return { isValid: true };
    }
    case 2:
      if (!data.length)
        return { isValid: false, message: "Please add at least one course" };
      return { isValid: true };
    default:
      return { isValid: true };
  }
};

// Main component
const TimetableCreator = ({ setActiveComponent, setHasTimeTable }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState("start");
  const [loading, setLoading] = useState(false);
  const now = new Date(new Date().getTime());

  const [mergeMode, setMergeMode] = useState(false);
  const [mergingSlots, setMergingSlots] = useState([]);

  // Step 1: User Information
  const [userData, setUserData] = useState({
    semester: "",
    branch: "",
    courseStartDate: null,
    courseEndDate: null,
    minAttendance: "85",
  });

  // Step 2: Course Information
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState({
    name: "",
    fullName: "",
    type: "theory",
    instructor: "",
    minAttendance: "",
  });
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseIndex, setEditingCourseIndex] = useState(null);
  const courseIdError = false;

  // Step 3: Timetable Events
  const [events, setEvents] = useState([]);
  const [slotAssignmentModalOpen, setSlotAssignmentModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  useEffect(() => {
    const rawPrefill = sessionStorage.getItem("communityTimetablePrefill");
    if (!rawPrefill) {
      return;
    }

    try {
      const prefill = JSON.parse(rawPrefill);
      const coursesFromPrefill = Array.isArray(prefill?.timeTable?.courses)
        ? prefill.timeTable.courses
        : [];
      const eventsFromPrefill = Array.isArray(prefill?.timeTable?.events)
        ? prefill.timeTable.events
        : [];

      setUserData((prev) => ({
        ...prev,
        semester: prefill?.semester || prev.semester,
        branch: prefill?.branch || prev.branch,
        minAttendance: String(prefill?.minAttendance || prev.minAttendance),
      }));

      setCourses(
        coursesFromPrefill.map((course) => ({
          ...course,
          minAttendance:
            course.minAttendance ??
            prefill?.minAttendance ??
            userData.minAttendance,
        })),
      );

      setEvents(
        eventsFromPrefill.map((event) => ({
          ...event,
          attendance: event.attendance || "pending",
        })),
      );

      setCurrentStep(2);
      toast.success("Community timetable loaded. You can edit and save it.");
    } catch (error) {
      console.error("Failed to load community timetable prefill", error);
      toast.error("Could not load community timetable for editing.");
    } finally {
      sessionStorage.removeItem("communityTimetablePrefill");
    }
  }, []);

  // Bottom bar visibility management for modals
  useBottomBarVisibility(isCourseModalOpen, "course-modal");
  useBottomBarVisibility(slotAssignmentModalOpen, "slot-assignment-modal");

  // Handle date selection
  const handleDateSelect = (date) => {
    if (calendarMode === "start") {
      setUserData({ ...userData, courseStartDate: date });
      setCalendarMode("end");
    } else {
      setUserData({ ...userData, courseEndDate: date });
      setCalendarOpen(false);
      setCalendarMode("start");
    }
  };

  // Open calendar for date selection
  const openCalendar = (mode) => {
    setCalendarMode(mode);
    setCalendarOpen(true);
  };

  // Enhanced handleUserDataChange
  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Enhanced handleCourseChange
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse({ ...currentCourse, [name]: value });
  };

  // Open course modal for add/edit
  const openCourseModal = (index = null) => {
    if (index !== null) {
      setCurrentCourse({ ...courses[index] });
      setEditingCourseIndex(index);
    } else {
      setCurrentCourse({
        name: "",
        fullName: "",
        type: "theory",
        instructor: "",
        minAttendance: userData.minAttendance,
      });
      setEditingCourseIndex(null);
    }
    setIsCourseModalOpen(true);
  };

  // Modify saveCourse to trim values on submission
  const saveCourse = () => {
    const trimmedCourse = {
      ...currentCourse,
      name: currentCourse.name.trim().toUpperCase(),
      fullName: currentCourse.fullName.trim(),
      instructor: currentCourse.instructor?.trim() || "",
    };

    // Check for duplicate course code
    const isDuplicate = courses.some(
      (course, index) =>
        course.name === trimmedCourse.name && index !== editingCourseIndex,
    );

    if (trimmedCourse.name === "" || trimmedCourse.fullName === "") {
      toast.error("Course code and full name cannot be empty");
      return;
    }

    if (isDuplicate) {
      toast.error("Course code already exists");
      return;
    }

    try {
      if (editingCourseIndex !== null) {
        const updatedCourses = [...courses];
        updatedCourses[editingCourseIndex] = trimmedCourse;
        setCourses(updatedCourses);
        toast.success("Course updated successfully");
      } else {
        setCourses([...courses, trimmedCourse]);
        toast.success("Course added successfully");
      }
      setIsCourseModalOpen(false);
    } catch {
      toast.error("Failed to save course");
    }
  };

  // Delete course
  const deleteCourse = (index) => {
    const updatedCourses = [...courses];
    updatedCourses.splice(index, 1);
    setCourses(updatedCourses);
    // Also remove events with this course
    const courseToDelete = courses[index];
    const updatedEvents = events.filter(
      (event) => event.courseId !== courseToDelete.name,
    );
    setEvents(updatedEvents);
  };

  // Open slot assignment modal
  const openSlotAssignment = (day, slotId) => {
    setCurrentSlot({ day, slotId });
    setSlotAssignmentModalOpen(true);
  };

  // Assign course to slot
  const assignCourseToSlot = (courseId) => {
    if (mergeMode && mergingSlots.length > 1) {
      completeMerge(courseId);
      return;
    }

    const dayIndex = daysOfWeek.indexOf(currentSlot.day);
    const newEvent = {
      day: currentSlot.day,
      dayIndex,
      courseId,
      slotId: currentSlot.slotId,
      duration: 1,
      attendance: "pending",
      description: "",
    };

    // Remove any existing event in this slot
    const updatedEvents = events.filter(
      (event) =>
        !(event.day === currentSlot.day && event.slotId === currentSlot.slotId),
    );

    setEvents([...updatedEvents, newEvent]);
    setSlotAssignmentModalOpen(false);
  };

  // Remove course from slot
  const removeCourseFromSlot = (day, slotId) => {
    const updatedEvents = events.filter(
      (event) => !(event.day === day && event.slotId === slotId),
    );
    setEvents(updatedEvents);
  };

  // Get course for a specific slot
  const getCourseForSlot = (day, slotId) => {
    // First check for direct slot assignment
    let event = events.find(
      (event) => event.day === day && event.slotId === slotId,
    );

    if (event) return event;

    // Then check if this slot is part of a merged set
    event = events.find(
      (event) =>
        event.day === day &&
        event.mergedSlots &&
        event.mergedSlots.includes(slotId),
    );

    return event;
  };

  // Modify nextStep to include validation
  const nextStep = () => {
    const validation = validateStep(
      currentStep,
      currentStep === 1 ? userData : currentStep === 2 ? courses : null,
    );

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    // If step 1 is valid, trim the branch value before proceeding
    if (currentStep === 1) {
      setUserData((prev) => ({
        ...prev,
        branch: prev.branch.trim(),
      }));
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Enhanced getFinalTimetableData
  const getFinalTimetableData = async () => {
    try {
      setLoading(true);
      if (!isLoading && !isAuthenticated) {
        toast.error("You must be signed in to save the timetable");
        return;
      }

      // Validate timetable has at least one event
      if (events.length === 0) {
        toast.error("Please add at least one course to the timetable");
        return;
      }
      const token = await getAccessTokenSilently();
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/timetable/upload`,
        {
          timeTable: {
            timeSlots,
            courses: courses.map((course) => ({
              ...course,
              minAttendance: course.minAttendance || userData.minAttendance,
            })),
            events,
          },
          user: {
            email: user.email,
            fullName: user.name,
            imageUrl: user.picture,
            ...userData,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (result.data.success) {
        toast.success("Timetable created successfully!");
        setHasTimeTable(true);
        setActiveComponent("main");
      } else {
        toast.error("Failed to save timetable");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save timetable");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  //   Merge Slots Functionality
  const handleSlotMerge = (day, slotId) => {
    // Check if slot is already assigned to a course
    const existingEvent = getCourseForSlot(day, slotId);
    if (existingEvent) return;

    // Check if slot is a break
    const isBreakSlot = timeSlots.find((s) => s.slotId === slotId)?.isBreak;
    if (isBreakSlot) return;

    const slotInfo = { day, slotId };

    // If there are no slots selected yet, add this one
    if (mergingSlots.length === 0) {
      setMergingSlots([slotInfo]);
      return;
    }

    // Check if we're already tracking this day
    const daySlots = mergingSlots.filter((slot) => slot.day === day);
    if (daySlots.length === 0) {
      // First slot for this day
      setMergingSlots([...mergingSlots, slotInfo]);
    } else {
      // Get non-break time slots
      const nonBreakTimeSlots = timeSlots.filter((ts) => !ts.isBreak);

      // Check if this slot is adjacent to existing slots (excluding breaks)
      const slotIndexInNonBreak = nonBreakTimeSlots.findIndex(
        (s) => s.slotId === slotId,
      );

      const isAdjacent = daySlots.some((slot) => {
        const existingSlotIndexInNonBreak = nonBreakTimeSlots.findIndex(
          (s) => s.slotId === slot.slotId,
        );
        return (
          Math.abs(existingSlotIndexInNonBreak - slotIndexInNonBreak) === 1
        );
      });

      if (isAdjacent) {
        setMergingSlots([...mergingSlots, slotInfo]);
      } else {
        // Not adjacent, update selection
        setMergingSlots([slotInfo]);
      }
    }
  };

  // Add this function to complete the merge
  const completeMerge = (courseId) => {
    if (mergingSlots.length < 2) return;

    // Group by day
    const slotsByDay = {};
    mergingSlots.forEach((slot) => {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot.slotId);
    });

    // For each day, create merged events
    Object.entries(slotsByDay).forEach(([day, slots]) => {
      if (slots.length < 2) return;

      // Sort slots by their position in timeSlots
      slots.sort((a, b) => {
        const aIndex = timeSlots.findIndex((s) => s.slotId === a);
        const bIndex = timeSlots.findIndex((s) => s.slotId === b);
        return aIndex - bIndex;
      });

      // Check if slots are consecutive (after filtering out breaks)
      const nonBreakTimeSlots = timeSlots.filter((ts) => !ts.isBreak);
      const slotIndices = slots.map((slotId) =>
        nonBreakTimeSlots.findIndex((ts) => ts.slotId === slotId),
      );

      const isConsecutive = slotIndices.every(
        (idx, i) => i === 0 || idx === slotIndices[i - 1] + 1,
      );

      if (!isConsecutive) {
        alert("Selected slots must be consecutive. Please try again.");
        return;
      }

      // Create a merged event for the first slot
      const dayIndex = daysOfWeek.indexOf(day);
      const newEvent = {
        day,
        dayIndex,
        courseId,
        slotId: slots[0],
        mergedSlots: slots,
        duration: slots.length,
        attendance: "pending",
        description: "Merged slots",
      };

      // Remove any existing events in these slots
      const updatedEvents = events.filter(
        (event) => !(event.day === day && slots.includes(event.slotId)),
      );

      setEvents([...updatedEvents, newEvent]);
    });

    // Reset merge state
    setMergeMode(false);
    setMergingSlots([]);
    setSlotAssignmentModalOpen(false);
  };

  // Add a function to highlight mergeable slots
  const isSlotHighlighted = (day, slotId) => {
    return mergingSlots.some(
      (slot) => slot.day === day && slot.slotId === slotId,
    );
  };

  // Render steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
            className={stepCardCn}
          >
            <h2 className="mt-0 text-center text-xl font-semibold text-foreground sm:text-2xl">
              Student Information
            </h2>
            <p className="mb-5 text-center text-sm text-muted-foreground sm:text-base">
              Enter your basic academic details
            </p>

            <div className="mb-4">
              <label
                htmlFor="semester"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Semester
              </label>
              <UiSelect
                value={String(userData.semester)}
                onValueChange={(value) =>
                  setUserData({ ...userData, semester: value })
                }
              >
                <SelectTrigger id="semester" className="w-full">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      Semester {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>

            <div className="mb-4">
              <label
                htmlFor="branch"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Branch / Department
              </label>
              <UiInput
                type="text"
                id="branch"
                name="branch"
                placeholder="e.g. CSE"
                value={userData.branch}
                onChange={(e) => {
                  if (!(e.target.value > 30)) {
                    handleUserDataChange(e);
                  } else {
                    toast.info("Branch too long");
                  }
                }}
                autoComplete="off"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="mb-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Course Start Date
                </label>
                <UiInput
                  type="text"
                  placeholder="Select start date"
                  value={
                    userData.courseStartDate
                      ? formatDate(userData.courseStartDate)
                      : ""
                  }
                  onClick={() => openCalendar("start")}
                  readOnly
                  required
                  className="cursor-pointer"
                />
              </div>

              <div className="mb-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Course End Date
                </label>
                <UiInput
                  type="text"
                  placeholder="Select end date"
                  value={
                    userData.courseEndDate
                      ? formatDate(userData.courseEndDate)
                      : ""
                  }
                  onClick={() => openCalendar("end")}
                  readOnly
                  required
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-4 mt-2">
              <label
                htmlFor="minAttendance"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Minimum Attendance Percentage ({userData.minAttendance}%)
              </label>
              <div className="px-1">
                <input
                  type="range"
                  id="minAttendance"
                  name="minAttendance"
                  min="50"
                  max="100"
                  step="5"
                  value={userData.minAttendance}
                  onChange={handleUserDataChange}
                  required
                  className="w-full cursor-pointer accent-primary"
                />
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-muted-foreground">50%</span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            </div>

            <div className="mb-8 mt-4 flex justify-end">
              <Button onClick={nextStep}>
                Next <ArrowForward fontSize="small" />
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
            className={stepCardCn}
          >
            <h2 className="mt-0 text-center text-xl font-semibold text-foreground sm:text-2xl">
              Course Information
            </h2>
            <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
              Add all your courses for the semester
            </p>

            <Button
              onClick={() => openCourseModal()}
              className="mb-5 self-start"
            >
              <AddCircle fontSize="small" /> Add New Course
            </Button>

            {courses.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No courses added yet. Click the button above to add your first
                course.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate font-semibold text-sm">
                          {course.name}
                        </div>
                        <div className="mt-0.5 truncate text-sm text-muted-foreground">
                          {course.fullName}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <IconButton
                          size="small"
                          onClick={() => openCourseModal(index)}
                          style={{ color: "hsl(var(--primary))" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteCourse(index)}
                          style={{ color: "hsl(var(--destructive))" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <div className="text-xs text-muted-foreground">
                        Type:{" "}
                        {course.type.charAt(0).toUpperCase() +
                          course.type.slice(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Instructor: {course.instructor || "TBD"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min. Attendance:{" "}
                        {course.minAttendance || userData.minAttendance}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowBack fontSize="small" /> Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowForward fontSize="small" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
            className={stepCardCn}
          >
            <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
              Assign courses to time slots by clicking on an empty cell
            </p>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Button
                variant={mergeMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMergeMode(!mergeMode);
                  setMergingSlots([]);
                }}
              >
                {mergeMode ? "Cancel Merge" : "Merge Slots"}
              </Button>
              {mergeMode && (
                <span className="text-xs text-muted-foreground sm:text-sm">
                  Select adjacent slots to merge (same day only)
                </span>
              )}
            </div>

            {mergeMode && mergingSlots.length > 1 && (
              <Button
                size="sm"
                onClick={() => setSlotAssignmentModalOpen(true)}
                className="mb-3 self-start"
              >
                Assign Course to Merged Slots
              </Button>
            )}

            {/* Scrollable timetable grid */}
            <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-2 touch-pan-x [scrollbar-color:hsl(var(--muted-foreground)/0.4)_transparent] [scrollbar-width:thin]">
              <div
                className="grid w-max min-w-[640px] gap-0.5 rounded-2xl bg-border p-0.5"
                style={{
                  gridTemplateColumns: "auto repeat(5, minmax(110px, 1fr))",
                }}
              >
                {/* Header row */}
                <div className="flex min-h-[48px] items-center justify-center rounded-[10px] bg-background px-2 py-2 text-sm font-semibold" />
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="flex min-h-[48px] items-center justify-center rounded-[10px] bg-background px-2 py-2 text-center text-sm font-semibold"
                  >
                    {day}
                  </div>
                ))}

                {/* Slot rows */}
                {timeSlots
                  .filter((slot) => !slot.isBreak)
                  .map((slot) => (
                    <React.Fragment key={slot.slotId}>
                      <div className="flex min-h-[56px] items-center justify-center rounded-[10px] bg-background px-2 py-2 text-center text-[11px] leading-tight text-foreground sm:text-xs">
                        {slot.display}
                      </div>

                      {daysOfWeek.map((day) => {
                        const event = getCourseForSlot(day, slot.slotId);
                        const course = event
                          ? courses.find((c) => c.name === event.courseId)
                          : null;
                        const highlighted = isSlotHighlighted(day, slot.slotId);

                        return event && course ? (
                          <div
                            key={`${day}-${slot.slotId}`}
                            className="flex min-h-[56px] cursor-pointer flex-col justify-center rounded-[10px] border border-primary/20 bg-secondary px-2 py-2 transition-all hover:bg-primary/[0.07]"
                            onClick={() =>
                              removeCourseFromSlot(day, slot.slotId)
                            }
                            style={{
                              gridRow: event.mergedSlots
                                ? `span ${event.mergedSlots.length}`
                                : "auto",
                              opacity:
                                event.mergedSlots &&
                                event.mergedSlots[0] !== slot.slotId
                                  ? 0
                                  : 1,
                              display:
                                event.mergedSlots &&
                                event.mergedSlots[0] !== slot.slotId
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            <div className="truncate text-[11px] font-semibold sm:text-xs">
                              {course.name}
                            </div>
                            <div className="truncate text-[10px] opacity-70 sm:text-xs">
                              {course.instructor || "TBD"}
                            </div>
                            {event.mergedSlots && (
                              <div className="text-[10px] opacity-60">
                                ×{event.mergedSlots.length} slots
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            key={`${day}-${slot.slotId}`}
                            className={cn(
                              "flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] text-[11px] text-muted-foreground transition-colors sm:text-xs",
                              highlighted
                                ? "border-2 border-dashed border-primary bg-primary/20"
                                : "bg-background hover:bg-secondary/80",
                            )}
                            onClick={() =>
                              mergeMode
                                ? handleSlotMerge(day, slot.slotId)
                                : openSlotAssignment(day, slot.slotId)
                            }
                          >
                            {mergeMode ? (highlighted ? "✓" : "+") : "+ Add"}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowBack fontSize="small" /> Back
              </Button>
              <Button onClick={getFinalTimetableData}>
                Finish <ArrowForward fontSize="small" />
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return loading ? (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-muted border-t-primary" />
    </div>
  ) : (
    <div className="mt-1 flex flex-col gap-2">
      {/* Step indicator */}
      <div className="flex flex-wrap justify-center gap-2 py-1 sm:gap-3">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              "flex flex-col items-center rounded-full border bg-card px-3 py-2 transition-colors",
              step === currentStep ? "border-primary/50" : "border-border",
            )}
          >
            <div
              className={cn(
                "mx-1 h-2.5 w-2.5 rounded-full transition-all",
                step === currentStep
                  ? "bg-primary"
                  : step < currentStep
                    ? "bg-primary/50"
                    : "bg-muted",
              )}
            />
            <span
              className={cn(
                "mt-1 text-xs transition-all",
                step === currentStep
                  ? "font-semibold text-primary"
                  : step < currentStep
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step === 1
                ? "Student Info"
                : step === 2
                  ? "Courses"
                  : "Timetable"}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

      {/* Calendar date picker dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {calendarMode === "start"
                ? "Select Start Date"
                : "Select End Date"}
            </DialogTitle>
            <DialogDescription>
              Pick your semester timeline dates for attendance tracking.
            </DialogDescription>
          </DialogHeader>

          <div className={calendarSurfaceClassName}>
            <Calendar
              className="shadcn-calendar"
              minDate={
                calendarMode === "end" && userData.courseStartDate
                  ? new Date(new Date().getTime())
                  : new Date("2020-01-01")
              }
              maxDate={calendarMode === "start" ? now : new Date("2030-01-01")}
              value={
                calendarMode === "start"
                  ? userData.courseStartDate
                  : userData.courseEndDate
              }
              onChange={handleDateSelect}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCalendarOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit course dialog */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourseIndex !== null ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              Define the course metadata used across timetable and attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Course Code
              </label>
              <UiInput
                type="text"
                id="name"
                name="name"
                placeholder="e.g. MA221TC"
                value={currentCourse.name}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    handleCourseChange(e);
                  } else {
                    toast.info("Course too long");
                  }
                }}
                className={courseIdError ? "border-destructive" : ""}
              />
              {courseIdError && (
                <p className="text-xs text-destructive">{courseIdError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Course Name
              </label>
              <UiInput
                type="text"
                id="fullName"
                name="fullName"
                placeholder="e.g. Mathematics II"
                autoComplete="off"
                value={currentCourse.fullName}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    handleCourseChange(e);
                  } else {
                    toast.info("Name too long");
                  }
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Course Type
                </label>
                <UiSelect
                  value={currentCourse.type}
                  onValueChange={(value) =>
                    setCurrentCourse((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                  </SelectContent>
                </UiSelect>
              </div>

              <div className="space-y-2">
                <label htmlFor="instructor" className="text-sm font-medium">
                  Instructor
                </label>
                <UiInput
                  type="text"
                  id="instructor"
                  name="instructor"
                  placeholder="John Doe"
                  value={currentCourse.instructor}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      handleCourseChange(e);
                    } else {
                      toast.info("Name too long");
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="courseMinAttendance"
                className="text-sm font-medium"
              >
                Minimum Attendance (%)
                {currentCourse.minAttendance
                  ? ""
                  : ` (Default: ${userData.minAttendance}%)`}
              </label>
              <UiInput
                type="number"
                id="courseMinAttendance"
                name="minAttendance"
                placeholder={`Default: ${userData.minAttendance}%`}
                min="0"
                max="100"
                value={currentCourse.minAttendance}
                onChange={handleCourseChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCourseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveCourse}
              disabled={!currentCourse.name || !currentCourse.fullName}
            >
              {editingCourseIndex !== null ? "Update" : "Add"} Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot assignment dialog */}
      <Dialog
        open={slotAssignmentModalOpen}
        onOpenChange={setSlotAssignmentModalOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mergeMode && mergingSlots.length > 1
                ? `Assign Course to ${mergingSlots.length} Merged Slots`
                : `Assign Course to ${currentSlot?.day} ${
                    timeSlots.find((s) => s.slotId === currentSlot?.slotId)
                      ?.display
                  }`}
            </DialogTitle>
            <DialogDescription>
              Choose one course to map to this slot selection.
            </DialogDescription>
          </DialogHeader>

          {courses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No courses available. Please add courses first.
            </p>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
              {courses.map((course, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => assignCourseToSlot(course.name)}
                  className="w-full rounded-xl border border-border/70 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent"
                >
                  <p className="text-sm font-semibold">{course.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.fullName}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Type:{" "}
                    {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Instructor: {course.instructor || "TBD"}
                  </p>
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSlotAssignmentModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableCreator;

TimetableCreator.propTypes = {
  setActiveComponent: PropTypes.func.isRequired,
  setHasTimeTable: PropTypes.func.isRequired,
};
