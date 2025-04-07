import React, { useEffect, useState } from "react";
import styled, { ThemeProvider, useTheme } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "react-calendar";
import { IconButton, Box } from "@mui/material";
import {
  Close,
  AddCircle,
  Delete,
  Edit,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";

import axios from "axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

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

const Card = styled(motion.div)`
  background-color: ${(props) => props.theme.cardTheme};
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.border};
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s ease;
  max-height: calc(100vh - 120px);
  overflow-y: auto;

  @media (min-width: 768px) {
    padding: 2rem;
  }
  @media (max-width: 768px) {
    margin-top: 3rem;
    padding: 2rem;
  }
`;

const StepText = styled.span`
  font-size: ${(props) => (props.vertical ? "0.9rem" : "0.75rem")};
  color: ${(props) =>
    props.active
      ? props.theme.primary
      : props.completed
      ? props.theme.text
      : props.theme.text + "60"};
  font-weight: ${(props) => (props.active || props.completed ? "600" : "400")};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const StyledButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
`;

const PrimaryButton = styled(StyledButton)`
  background: ${(props) => props.theme.gradient};
  color: white;
  border-radius: 12px;
  padding: 0.85rem 1.75rem;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 15px rgba(74, 144, 226, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(74, 144, 226, 0.4);
  }
`;

const SecondaryButton = styled(StyledButton)`
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.primary + "10"};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const TimetableGrid = styled.div`
  display: grid;
  grid-template-columns: auto repeat(5, minmax(120px, 1fr));
  gap: 2px;
  margin-top: 1rem;
  min-width: 700px; // Minimum width to ensure readability
`;

const TimeCell = styled.div`
  padding: 0.75rem;
  text-align: center;
  background-color: ${(props) => props.theme.secondary};
  border-radius: 6px;
  font-weight: ${(props) => (props.isHeader ? "600" : "400")};
  font-size: ${(props) => (props.isHeader ? "0.9rem" : "0.8rem")};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${(props) => (props.isBreak ? "30px" : "60px")};
  color: ${(props) =>
    props.isBreak ? props.theme.text + "80" : props.theme.text};
  position: relative;
`;

const DayCell = styled.div`
  padding: 0.75rem;
  text-align: center;
  background-color: ${(props) => props.theme.secondary};
  font-weight: 600;
  border-radius: 6px;
`;

const CourseCell = styled.div`
  padding: 0.75rem 0.5rem;
  background-color: ${(props) => props.theme.primary + "20"};
  border-radius: 6px;
  border-left: 3px solid ${(props) => props.theme.primary};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.primary + "30"};
  }
`;

const CourseName = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
`;

const CourseInfo = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const CourseList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const CourseCard = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => props.theme.primary + "60"};
  }
`;

const CourseCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const CourseActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptySlot = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  min-height: 60px;

  &:hover {
    background-color: ${(props) => props.theme.secondary};
  }
`;

const CalendarContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
`;

const CalendarCard = styled(motion.div)`
  background-color: ${(props) => props.theme.cardTheme};
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  width: 95%;
  max-width: 350px;

  @media (min-width: 480px) {
    padding: 1.5rem;
    border-radius: 16px;
    max-width: 400px;
  }

  .react-calendar {
    border: none;
    width: 100%;
    font-family: inherit;
    background: transparent;
    font-size: 0.9rem;
    color: ${(props) => props.theme.text};

    @media (min-width: 480px) {
      font-size: 1rem;
    }
  }

  .react-calendar__navigation {
    display: flex;
    margin-bottom: 0.75rem;
    align-items: center;

    @media (min-width: 480px) {
      margin-bottom: 1rem;
    }
  }

  .react-calendar__navigation button {
    min-width: 36px;
    background: none;
    font-size: 1rem;
    font-weight: 600;
    color: ${(props) => props.theme.primary};
    padding: 0.4rem;
    border-radius: 6px;
    transition: all 0.2s;

    @media (min-width: 480px) {
      min-width: 44px;
      font-size: 1.1rem;
      padding: 0.5rem;
      border-radius: 8px;
    }

    &:hover {
      background-color: ${(props) => props.theme.secondary};
    }

    &:disabled {
      background-color: transparent;
      color: ${(props) => props.theme.border};
      cursor: not-allowed;
    }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.7rem;
    color: ${(props) => props.theme.text}80;
    margin-bottom: 0.4rem;

    @media (min-width: 480px) {
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }
  }

  .react-calendar__month-view__days__day {
    padding: 0.5rem 0.3rem;
    font-size: 0.8rem;
    color: ${(props) => props.theme.text};
    border-radius: 6px;
    transition: all 0.2s;

    @media (min-width: 480px) {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
      border-radius: 8px;
    }

    &:hover {
      background-color: ${(props) => props.theme.secondary};
    }

    &--weekend {
      color: ${(props) => props.theme.accent};
    }

    &--neighboringMonth {
      color: ${(props) => props.theme.border};
    }
  }

  .react-calendar__tile {
    position: relative;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 480px) {
      height: 44px;
    }

    &:disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .react-calendar__tile--active {
    background-color: ${(props) => props.theme.primary};
    color: white;
    border-radius: 6px;

    @media (min-width: 480px) {
      border-radius: 8px;
    }

    &:hover {
      background-color: ${(props) => props.theme.primary};
    }
  }

  .react-calendar__tile--now {
    background-color: ${(props) => props.theme.secondary};
    color: ${(props) => props.theme.primary};
    border-radius: 6px;
    font-weight: 600;

    @media (min-width: 480px) {
      border-radius: 8px;
    }
  }

  .react-calendar__tile--hasActive {
    background-color: ${(props) => props.theme.primary};
    color: white;
    border-radius: 6px;

    @media (min-width: 480px) {
      border-radius: 8px;
    }

    &:hover {
      background-color: ${(props) => props.theme.primary};
    }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  @media (min-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const CalendarTitle = styled.h4`
  font-weight: 600;
  font-size: 1rem;
  margin: 0;

  @media (min-width: 480px) {
    font-size: 1.125rem;
  }
`;

const ModalContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
`;

const ModalCard = styled(motion.div)`
  background-color: ${(props) => props.theme.cardTheme};
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
  margin-top: 0;

  text-align: center;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.text + "80"};
  text-align: center;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${(props) =>
    props.active
      ? props.theme.primary
      : props.completed
      ? props.theme.primary + "80"
      : props.theme.secondary};
  border-radius: 50%;
  margin: 0 4px;
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const calendarVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Simplify validation helper
const validateStep = (step, data) => {
  switch (step) {
    case 1:
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
    case 2:
      if (!data.length)
        return { isValid: false, message: "Please add at least one course" };
      return { isValid: true };
    default:
      return { isValid: true };
  }
};

// Main component
const TimetableCreator = ({
  setActiveComponent,
  setHasTimeTable,
  setShowHelpModal,
}) => {
  const theme = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState("start");
  const [loading, setLoading] = useState(false);
  const now = new Date();

  const [mergeMode, setMergeMode] = useState(false);
  const [mergingSlots, setMergingSlots] = useState([]);

  // Step 1: User Information
  const [userData, setUserData] = useState({
    semester: "",
    branch: "",
    courseStartDate: null,
    courseEndDate: null,
    minAttendance: "75",
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
  const [courseIdError, setCourseIdError] = useState(false);

  // Step 3: Timetable Events
  const [events, setEvents] = useState([]);
  const [slotAssignmentModalOpen, setSlotAssignmentModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

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
        course.name === trimmedCourse.name && index !== editingCourseIndex
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
    } catch (error) {
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
      (event) => event.courseId !== courseToDelete.name
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
        !(event.day === currentSlot.day && event.slotId === currentSlot.slotId)
    );

    setEvents([...updatedEvents, newEvent]);
    setSlotAssignmentModalOpen(false);
  };

  // Remove course from slot
  const removeCourseFromSlot = (day, slotId) => {
    const updatedEvents = events.filter(
      (event) => !(event.day === day && event.slotId === slotId)
    );
    setEvents(updatedEvents);
  };

  // Get course for a specific slot
  const getCourseForSlot = (day, slotId) => {
    // First check for direct slot assignment
    let event = events.find(
      (event) => event.day === day && event.slotId === slotId
    );

    if (event) return event;

    // Then check if this slot is part of a merged set
    event = events.find(
      (event) =>
        event.day === day &&
        event.mergedSlots &&
        event.mergedSlots.includes(slotId)
    );

    return event;
  };

  // Modify nextStep to include validation
  const nextStep = () => {
    const validation = validateStep(
      currentStep,
      currentStep === 1 ? userData : currentStep === 2 ? courses : null
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
        }
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
        (s) => s.slotId === slotId
      );

      const isAdjacent = daySlots.some((slot) => {
        const existingSlotIndexInNonBreak = nonBreakTimeSlots.findIndex(
          (s) => s.slotId === slot.slotId
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
        nonBreakTimeSlots.findIndex((ts) => ts.slotId === slotId)
      );

      const isConsecutive = slotIndices.every(
        (idx, i) => i === 0 || idx === slotIndices[i - 1] + 1
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
        (event) => !(event.day === day && slots.includes(event.slotId))
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
      (slot) => slot.day === day && slot.slotId === slotId
    );
  };

  // Render steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
          >
            <SectionTitle>Student Information</SectionTitle>
            <SectionDescription>
              Enter your basic academic details
            </SectionDescription>

            <FormGroup>
              <Label htmlFor="semester">Semester</Label>
              <Select
                id="semester"
                name="semester"
                value={userData.semester}
                onChange={handleUserDataChange}
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="branch">Branch / Department</Label>
              <Input
                type="text"
                id="branch"
                name="branch"
                placeholder="CSE"
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
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Course Start Date</Label>
                <Input
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
                />
              </FormGroup>

              <FormGroup>
                <Label>Course End Date</Label>
                <Input
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
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="minAttendance">
                Minimum Attendance Percentage ({userData.minAttendance}%)
              </Label>
              <div style={{ padding: "0 10px" }}>
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
                  style={{
                    width: "100%",
                    height: "8px",
                    borderRadius: "4px",
                    appearance: "none",
                    background: `linear-gradient(to right, ${
                      currentTheme.primary
                    } 0%, ${currentTheme.primary} ${
                      ((userData.minAttendance - 50) / 50) * 100
                    }%, ${currentTheme.secondary} ${
                      ((userData.minAttendance - 50) / 50) * 100
                    }%, ${currentTheme.secondary} 100%)`,
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.8rem" }}>50%</span>
                  <span style={{ fontSize: "0.8rem" }}>100%</span>
                </div>
              </div>
            </FormGroup>

            <ButtonGroup>
              <PrimaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
              >
                Next <ArrowForward fontSize="small" />
              </PrimaryButton>
            </ButtonGroup>
          </Card>
        );

      case 2:
        return (
          <Card
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
          >
            <h2></h2>
            <p></p>
            <SectionTitle>Course Information</SectionTitle>
            <SectionDescription>
              Add all your courses for the semester
            </SectionDescription>
            <PrimaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openCourseModal()}
              style={{ marginBottom: "1.5rem" }}
            >
              <AddCircle fontSize="small" /> Add New Course
            </PrimaryButton>

            {courses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 0",
                  color: `${currentTheme.text}80`,
                }}
              >
                No courses added yet. Click the button above to add your first
                course.
              </div>
            ) : (
              <CourseList>
                {courses.map((course, index) => (
                  <CourseCard key={index}>
                    <CourseCardHeader>
                      <div>
                        <CourseName>{course.name}</CourseName>
                        <div style={{ fontSize: "1rem", marginTop: "0.25rem" }}>
                          {course.fullName}
                        </div>
                      </div>
                      <CourseActionButtons>
                        <IconButton
                          size="small"
                          onClick={() => openCourseModal(index)}
                          style={{ color: currentTheme.primary }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteCourse(index)}
                          style={{ color: currentTheme.accent }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </CourseActionButtons>
                    </CourseCardHeader>
                    <div style={{ marginTop: "0.75rem" }}>
                      <CourseInfo>
                        Type:{" "}
                        {course.type.charAt(0).toUpperCase() +
                          course.type.slice(1)}
                      </CourseInfo>
                      <CourseInfo>
                        Instructor: {course.instructor || "TBD"}
                      </CourseInfo>
                      <CourseInfo>
                        Min. Attendance:{" "}
                        {course.minAttendance || userData.minAttendance}%
                      </CourseInfo>
                    </div>
                  </CourseCard>
                ))}
              </CourseList>
            )}

            <ButtonGroup>
              <SecondaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
              >
                <ArrowBack fontSize="small" /> Back
              </SecondaryButton>
              <PrimaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
              >
                Next <ArrowForward fontSize="small" />
              </PrimaryButton>
            </ButtonGroup>
          </Card>
        );

      case 3:
        return (
          <Card
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
          >
            <SectionTitle>Create Your Timetable</SectionTitle>
            <SectionDescription>
              Assign courses to time slots by clicking on an empty cell
            </SectionDescription>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <SecondaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMergeMode(!mergeMode);
                  setMergingSlots([]);
                }}
                style={{
                  backgroundColor: mergeMode
                    ? currentTheme.primary
                    : "transparent",
                  color: mergeMode ? "white" : currentTheme.primary,
                }}
              >
                {mergeMode ? "Cancel Merge" : "Merge Slots"}
              </SecondaryButton>
              {mergeMode && (
                <div
                  style={{
                    marginLeft: "1rem",
                    color: currentTheme.text + "80",
                  }}
                >
                  Select adjacent slots to merge (same day only)
                </div>
              )}
            </div>

            {/* Add this button to confirm merge if there are slots selected */}
            {mergeMode && mergingSlots.length > 1 && (
              <PrimaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSlotAssignmentModalOpen(true)}
                style={{ marginBottom: "1rem" }}
              >
                Assign Course to Merged Slots
              </PrimaryButton>
            )}
            <TimetableGrid>
              <TimeCell isHeader={true}></TimeCell>
              {daysOfWeek.map((day) => (
                <DayCell key={day}>{day}</DayCell>
              ))}

              {timeSlots
                .filter((slot) => !slot.isBreak) // Filter out break slots
                .map((slot) => (
                  <React.Fragment key={slot.slotId}>
                    <TimeCell>{slot.display}</TimeCell>

                    {daysOfWeek.map((day) => {
                      const event = getCourseForSlot(day, slot.slotId);
                      const course = event
                        ? courses.find((c) => c.name === event.courseId)
                        : null;

                      return event && course ? (
                        <CourseCell
                          key={`${day}-${slot.slotId}`}
                          onClick={() => removeCourseFromSlot(day, slot.slotId)}
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
                          <CourseName>{course.name}</CourseName>
                          <CourseInfo>{course.instructor || "TBD"}</CourseInfo>
                          {event.mergedSlots && (
                            <CourseInfo>
                              Merged: {event.mergedSlots.length} slots
                            </CourseInfo>
                          )}
                        </CourseCell>
                      ) : (
                        <EmptySlot
                          key={`${day}-${slot.slotId}`}
                          onClick={() =>
                            mergeMode
                              ? handleSlotMerge(day, slot.slotId)
                              : openSlotAssignment(day, slot.slotId)
                          }
                          style={{
                            backgroundColor: isSlotHighlighted(day, slot.slotId)
                              ? currentTheme.primary + "30"
                              : "transparent",
                            border: isSlotHighlighted(day, slot.slotId)
                              ? `2px dashed ${currentTheme.primary}`
                              : "none",
                          }}
                        >
                          {mergeMode
                            ? isSlotHighlighted(day, slot.slotId)
                              ? "Selected"
                              : "Select"
                            : "+ Add"}
                        </EmptySlot>
                      );
                    })}
                  </React.Fragment>
                ))}
            </TimetableGrid>

            <ButtonGroup>
              <SecondaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
              >
                <ArrowBack fontSize="small" /> Back
              </SecondaryButton>
              <PrimaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success("Timetable saved successfully!");
                  getFinalTimetableData();
                }}
              >
                Finish <ArrowForward fontSize="small" />
              </PrimaryButton>
            </ButtonGroup>
          </Card>
        );
      default:
        return null;
    }
  };

  return loading ? (
    <LoadingSpinner>
      <div className="spinner" />
    </LoadingSpinner>
  ) : (
    <>
      <StepIndicator>
        {[1, 2, 3].map((step) => (
          <StepLabel key={step}>
            <StepDot
              active={step === currentStep}
              completed={step < currentStep}
            />
            <StepText active={step === currentStep}>
              {step === 1
                ? "Student Info"
                : step === 2
                ? "Courses"
                : "Timetable"}
            </StepText>
          </StepLabel>
        ))}
      </StepIndicator>

      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {calendarOpen && (
          <CalendarContainer
            initial="initial"
            animate="animate"
            exit="exit"
            variants={calendarVariants}
            onClick={() => setCalendarOpen(false)}
          >
            <CalendarCard
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <CalendarHeader>
                <CalendarTitle>
                  {calendarMode === "start"
                    ? "Select Start Date"
                    : "Select End Date"}
                </CalendarTitle>
                <IconButton size="small" onClick={() => setCalendarOpen(false)}>
                  <Close />
                </IconButton>
              </CalendarHeader>

              <Calendar
                minDate={
                  calendarMode === "end" && userData.courseStartDate
                    ? new Date()
                    : new Date("2020-01-01")
                }
                maxDate={
                  calendarMode === "start" ? now : new Date("2030-01-01")
                }
                value={
                  calendarMode === "start"
                    ? userData.courseStartDate
                    : userData.courseEndDate
                }
                onChange={handleDateSelect}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <PrimaryButton onClick={() => setCalendarOpen(false)}>
                  Cancel
                </PrimaryButton>
              </Box>
            </CalendarCard>
          </CalendarContainer>
        )}
      </AnimatePresence>

      {/* Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <ModalContainer
            initial="initial"
            animate="animate"
            exit="exit"
            variants={calendarVariants}
            onClick={() => setIsCourseModalOpen(false)}
          >
            <ModalCard
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <ModalHeader>
                <ModalTitle>
                  {editingCourseIndex !== null
                    ? "Edit Course"
                    : "Add New Course"}
                </ModalTitle>
                <IconButton
                  size="small"
                  onClick={() => setIsCourseModalOpen(false)}
                >
                  <Close />
                </IconButton>
              </ModalHeader>

              <FormGroup>
                <Label htmlFor="name">Course Code</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. MA221TC"
                  value={currentCourse.name}
                  onChange={(e) => {
                    if (!(e.target.value > 30)) {
                      handleCourseChange(e);
                    } else {
                      toast.info("Course too long");
                    }
                  }}
                  style={courseIdError ? { borderColor: "red" } : {}}
                />
                {courseIdError && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {courseIdError}
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fullName">Course Name</Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Mathematics II"
                  autoComplete="off"
                  value={currentCourse.fullName}
                  onChange={(e) => {
                    if (!(e.target.value > 30)) {
                      handleCourseChange(e);
                    } else {
                      toast.info("Name too long");
                    }
                  }}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="type">Course Type</Label>
                  <Select
                    id="type"
                    name="type"
                    value={currentCourse.type}
                    onChange={handleCourseChange}
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="session">Session</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    type="text"
                    id="instructor"
                    name="instructor"
                    placeholder="John Doe"
                    value={currentCourse.instructor}
                    onChange={(e) => {
                      if (!(e.target.value > 30)) {
                        handleCourseChange(e);
                      } else {
                        toast.info("Name too long");
                      }
                    }}
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="courseMinAttendance">
                  Minimum Attendance (%){" "}
                  {currentCourse.minAttendance
                    ? ""
                    : `(Default: ${userData.minAttendance}%)`}
                </Label>
                <Input
                  type="number"
                  id="courseMinAttendance"
                  name="minAttendance"
                  placeholder={`Default: ${userData.minAttendance}%`}
                  min="0"
                  max="100"
                  value={currentCourse.minAttendance}
                  onChange={handleCourseChange}
                />
              </FormGroup>

              <ButtonGroup>
                <SecondaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCourseModalOpen(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveCourse}
                  disabled={!currentCourse.name || !currentCourse.fullName}
                  style={{
                    opacity:
                      currentCourse.name && currentCourse.fullName ? 1 : 0.6,
                  }}
                >
                  {editingCourseIndex !== null ? "Update" : "Add"} Course
                </PrimaryButton>
              </ButtonGroup>
            </ModalCard>
          </ModalContainer>
        )}
      </AnimatePresence>

      {/* Slot Assignment Modal */}
      <AnimatePresence>
        {slotAssignmentModalOpen && (
          <ModalContainer
            initial="initial"
            animate="animate"
            exit="exit"
            variants={calendarVariants}
            onClick={() => setSlotAssignmentModalOpen(false)}
          >
            <ModalCard
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <ModalHeader>
                <ModalTitle>
                  {mergeMode && mergingSlots.length > 1
                    ? `Assign Course to ${mergingSlots.length} Merged Slots`
                    : `Assign Course to ${currentSlot?.day} ${
                        timeSlots.find((s) => s.slotId === currentSlot?.slotId)
                          ?.display
                      }`}
                </ModalTitle>
                <IconButton
                  size="small"
                  onClick={() => setSlotAssignmentModalOpen(false)}
                >
                  <Close />
                </IconButton>
              </ModalHeader>

              {courses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem 0",
                    color: `${currentTheme.text}80`,
                  }}
                >
                  No courses available. Please add courses first.
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {courses.map((course, index) => (
                    <CourseCard
                      key={index}
                      onClick={() => assignCourseToSlot(course.name)}
                      style={{ cursor: "pointer", marginBottom: "0.75rem" }}
                    >
                      <CourseName>{course.name}</CourseName>
                      <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {course.fullName}
                      </div>
                      <CourseInfo>
                        Type:{" "}
                        {course.type.charAt(0).toUpperCase() +
                          course.type.slice(1)}
                      </CourseInfo>
                      <CourseInfo>
                        Instructor: {course.instructor || "TBD"}
                      </CourseInfo>
                    </CourseCard>
                  ))}
                </div>
              )}

              <ButtonGroup>
                <SecondaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSlotAssignmentModalOpen(false)}
                >
                  Cancel
                </SecondaryButton>
              </ButtonGroup>
            </ModalCard>
          </ModalContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default TimetableCreator;
