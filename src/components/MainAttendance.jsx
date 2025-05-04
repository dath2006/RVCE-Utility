import React, { useEffect, useRef, useState } from "react";
import d from "date-and-time";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Calendar from "react-calendar";
import timeSlots from "../data/timeSlots.json";

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
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

// Styled Components

const Card = styled.div`
  display: flex;
  // color: ${(props) => props.theme.text};
  // background: ${(props) => props.theme.cardTheme};
  flex-direction: column;
  padding: 2rem;
  align-items: center;
  justify-content: center;
  width: 95%;
  // min-height: calc(100vh - 8rem);
  // max-width: 1200px;
  // margin-top: 1.9rem;
  // border-radius: 16px;
  // overflow: hidden;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    margin: 0 auto;
    // width: 100%;
    // min-height: calc(100vh - 7rem);
    // gap: 1.25rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const DateNavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  background: ${(props) => props.theme.secondary};
  color: ${(props) => props.theme.text};
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: ${(props) =>
    props.theme.softShadow || "0 2px 10px rgba(0, 0, 0, 0.03)"};
  position: relative;
  border: 1px solid ${(props) => props.theme.border};

  @media (min-width: 433px and max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  @media (max-width: 433px) {
    padding: 0.75rem;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #3b82f6;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.glassbgc};
  }

  &:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
  }
`;

const JumpButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  height: calc(100% - 110px);
  overflow-y: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6rem;
  }
`;

const ScheduleContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  padding: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }
`;

const ClassCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0.75rem;
  border-radius: 12px;

  background-color: ${(props) => {
    if (props.attendance === "present") return "#f0fdf4";
    if (props.attendance === "absent") return "#fef2f2";
    if (props.attendance === "ignore") return "#f1f5f9";
    return `${props.theme.cardTheme}`;
  }};
  border: 2px solid
    ${(props) => {
      if (props.attendance === "present") return "#86efac";
      if (props.attendance === "absent") return "#fca5a5";
      if (props.attendance === "ignore") return "#cbd5e1";
      if (props.selected) return "#93c5fd";
      return "#e2e8f0";
    }};
  box-shadow: ${(props) =>
    props.selected
      ? "0 4px 12px rgba(59, 130, 246, 0.2)"
      : "0 2px 6px rgba(0, 0, 0, 0.04)"};
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${(props) => (props.attendance === "ignore" ? 0.6 : 1)};
  position: relative;
  min-height: 100px;

  &:hover {
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px ${(props) => props.theme.shadowHover}25;
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    min-height: 90px;
  }
`;

const AttendanceTag = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${(props) => {
    if (props.percentage >= props.minAttendance) return "#10b981";
    if (props.percentage >= props.minAttendance - 10) return "#f59e0b";
    return "#ef4444";
  }};
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WarningBadge = styled.div`
  position: absolute;
  top: -8px;
  right: 35px;
  background-color: #f59e0b;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
`;

const TimeDisplay = styled.div`
  font-size: 0.8rem;
  color: rgb(67, 56, 202);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
`;

const CourseDisplay = styled.div`
  font-weight: 600;
  color: rgb(67, 56, 202);
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  background-color: ${(props) =>
    props.variant === "primary" ? "#3b82f6" : "#f1f5f9"};
  color: ${(props) => (props.variant === "primary" ? "white" : "#475569")};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary" ? "#2563eb" : "#e2e8f0"};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const CalendarOverlay = styled(motion.div)`
  background-color: ${(props) => props.theme.cardTheme};
  position: absolute;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
  padding: 1.5rem;
  right: 0;
  top: calc(60% + 0.5rem);
  margin-top: 0.5rem;

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

const JumpMenu = styled(motion.div)`
  position: absolute;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text}
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 200px;
`;

const JumpMenuItem = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) => props.theme.secondary};
  }
`;

const DetailPanel = styled(motion.div)`
  position: absolute; // Changed from static to absolute
  top: 5rem;
  right: 0;
  max-height: 87vh;
  width: 400px; // Set a fixed width for the panel
  background: ${(props) => props.theme.cardTheme || "#f8fafc"};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: ${(props) =>
    props.theme.softShadow || "0 4px 6px rgba(0, 0, 0, 0.1)"};
  z-index: 100; // Ensure it appears above other elements
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%; // Full width for mobile
    max-height: 60vh;
    padding: 1.25rem;
    gap: 1.25rem;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f5f9;
    color: #334155;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 650px) {
    padding-bottom: 2rem;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.primary}20;
  }

  &:hover {
    border-color: ${(props) => props.theme.primary}80;
  }
`;

const TimeRangeContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const TimeInput = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
 background: ${(props) => props.theme.secondary};
  width: 100%;
  font-size: 1rem;
  color: ${(props) => props.theme.text}

  &:focus {
    outline: none;
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AttendanceOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AttendanceOption = styled.div`
  display: flex;
  gap: 1rem;
`;

const OptionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid
    ${(props) => {
      if (props.status === "present") return "#86efac";
      if (props.status === "absent") return "#fca5a5";
      if (props.status === "ignore") return "#cbd5e1";
      return "#e2e8f0";
    }};
  background-color: ${(props) => {
    if (props.status === "present") return "#f0fdf4";
    if (props.status === "absent") return "#fef2f2";
    if (props.status === "ignore") return "#f1f5f9";
    return "#ffffff";
  }};
  color: ${(props) => {
    if (props.status === "present") return "#166534";
    if (props.status === "absent") return "#b91c1c";
    if (props.status === "ignore") return "#475569";
    return "#64748b";
  }};
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: ${(props) => {
      if (props.status === "present") return "#4ade80";
      if (props.status === "absent") return "#f87171";
      if (props.status === "ignore") return "#94a3b8";
      return "#cbd5e1";
    }};
    background-color: ${(props) => {
      if (props.status === "present") return "#dcfce7";
      if (props.status === "absent") return "#fee2e2";
      if (props.status === "ignore") return "#e2e8f0";
      return "#f8fafc";
    }};
  }
`;

const IgnoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${(props) => props.theme.secondary};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  width: 100%;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.primary}20;
  }

  &:hover {
    border-color: ${(props) => props.theme.primary}80;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background-color: ${(props) =>
    props.variant === "primary" ? "#3b82f6" : "#f1f5f9"};
  color: ${(props) => (props.variant === "primary" ? "white" : "#475569")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary" ? "#2563eb" : "#e2e8f0"};
  }
`;

const LoadingSpinner = styled(motion.div)`
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

const MobilePopup = styled(motion.div)`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  justify-content: center;
  align-items: flex-end;
  padding: 1rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobilePopupContent = styled(motion.div)`
  background: ${(props) => props.theme.background};
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
`;

const MobilePopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
`;

const PopupTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
`;

// Add this to enhance the warning display
const WarningButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fef3c7;
  color: #b45309;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(180, 83, 9, 0.1);

  &:hover {
    background-color: #fde68a;
  }
`;

// Animation variants
const panelVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, x: 100, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.1 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 15 },
  },
};

const MainAttendance = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date(new Date().getTime());
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [accStart, setAccStart] = useState();
  const [accEnd, setAccEnd] = useState();
  const [date, setDate] = useState(new Date(now));
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState(null);
  // State for original data from server
  const [dayCache, setDayCache] = useState([]);
  // State for modified data (working copy)
  const [day, setDay] = useState([]);

  const [showDay, setShowDay] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [subjectAdd, setSubjectAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceState, setAttendanceState] = useState([]);

  // New state for the add subject form
  const [newSubject, setNewSubject] = useState();

  // Track description for day or subject
  const [description, setDescription] = useState("");

  const jumpMenuRef = useRef(null);
  const calendarRef = useRef(null);
  const initCalledRef = useRef(false);

  // Add useEffect for handling outside clicks
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
    if (!isLoading && isAuthenticated && date) {
      handleDayInit();
      handleAttendanceState();
    }
  }, [isLoading, isAuthenticated, date]);

  const handlePrev = () => {
    if (new Date(date).getTime() > new Date(accStart).getTime()) {
      setLoading(true);
      setDate((prev) => {
        return new Date(prev.valueOf() - 24 * 60 * 60 * 1000);
      });
    }
  };

  function formatMinutesFromMidnight(minutesFromMidnight) {
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;

    const time = new Date(0, 0, 0, hours, minutes);

    // 'hh:mm A' => 12-hour format with AM/PM
    return d.format(time, "hh:mm");
  }

  const handleForw = () => {
    const currentDate = new Date(now).setHours(0, 0, 0, 0);
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
      setLoading(true);
      setDate((prev) => {
        return new Date(prev.valueOf() + 24 * 60 * 60 * 1000);
      });
    }
  };

  const handleSubjectSelect = (id) => {
    setShowDay(false);
    setSubjectAdd(false);

    if (subject && subject.slotId === id) {
      setSubject(null);
      // Restore the original data from dayCache when closing subject panel
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
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/attendance/statistics?email=${
            user.email
          }`
        );
        if (res.data.data.success) {
          setAttendanceState(res.data.data.attendanceState);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update attendance state. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayInit = async () => {
    if (initCalledRef.current) return; // skip if already running
    initCalledRef.current = true;

    setSubject(null);
    setSubjectAdd(false);
    setShowDay(false);
    setLoading(true); // Set loading at the beginning

    try {
      if (!isLoading && isAuthenticated) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/attendance/init`,
          {
            user: {
              email: user.email,
              date: date,
            },
          }
        );
        if (res.data.response.success) {
          setCourses([...res.data.response.courses]);
          setAccStart(new Date(res.data.response.accStart));
          setAccEnd(new Date(res.data.response.accEnd));
          // Store deep copies to avoid reference issues
          const initialData = JSON.parse(res.data.response.dayTable);

          // Deep cloning the data to prevent reference issues
          setDayCache(JSON.parse(JSON.stringify(initialData)));
          setDay(JSON.parse(JSON.stringify(initialData)));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance data. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
      initCalledRef.current = false;
    }
  };

  const handleSubjectDelete = async () => {
    try {
      if (!isLoading && isAuthenticated && subject.custom) {
        setLoading(true);
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URL}/attendance/add?email=${
            user.email
          }&date=${date.toDateString()}&slotId=${subject.slotId}&courseId=${
            subject.courseId
          }`
        );

        // Only update day with the new data from server and update the cache as well
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/save`,
        {
          user: {
            email: user.email,
            date: date,
          },
          daySchedule: day,
        }
      );

      handleAttendanceState();
      if (res.data.success) {
        // Update both day and dayCache with a deep copy of the server response
        const savedData = JSON.parse(JSON.stringify(res.data.daySchedule));
        setDay(savedData);
        setDayCache(JSON.parse(JSON.stringify(savedData)));

        // Close panels
        setSubject(null);
        setShowDay(false);
        setSubjectAdd(false);

        // Show success notification
        toast.success("Attendance saved successfully!");
      } else {
        toast.error("Failed to save attendance. ");
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast.error("Failed to save attendance. Please try again.");
      // Restore from cache on error
      setDay(JSON.parse(JSON.stringify(dayCache)));
    } finally {
      setLoading(false);
    }
  };

  const addCustomSubject = async () => {
    // Calculate slotId based on time
    const startTime = newSubject.startTime;
    const endTime = newSubject.endTime;

    // Calculate minutes from midnight
    const startParts = startTime.split(":");
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

    const endParts = endTime.split(":");
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    // Create a new custom slot id
    const slotId = `custom-${startMinutes}-${endMinutes}`;

    // Create a new event
    const newEvent = {
      day: d.format(date, "ddd").toString().toUpperCase(),
      dayIndex: date.getDay() === 0 ? 6 : date.getDay() - 1,
      courseId: newSubject.courseId,
      slotId: slotId,
      duration: Math.ceil((endMinutes - startMinutes) / 60),
      attendance: "pending",
      display: `${newSubject.startTime} - ${newSubject.endTime}`,
      custom: true,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/add`,
        {
          user: {
            email: user.email,
            date: date,
          },
          subject: newEvent,
        }
      );
      if (res.data.success) {
        // Add the new subject to both day and dayCache
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
  return (
    <Card
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
      <Title>Attendance Manager</Title>

      <DateNavContainer>
        <DateDisplay>
          <NavButton
            onClick={handlePrev}
            disabled={
              new Date(date)?.getTime() <= new Date(accStart)?.getTime()
            }
          >
            <ChevronLeft size={20} />
          </NavButton>
          <span>{d.format(date, "ddd, MMM DD YYYY")}</span>
          <NavButton
            onClick={handleForw}
            disabled={
              new Date(date)?.setHours(0, 0, 0, 0) >=
                new Date(now).setHours(0, 0, 0, 0) &&
              new Date(date)?.getTime() <= new Date(accEnd).getTime()
            }
          >
            <ChevronRight size={20} />
          </NavButton>
        </DateDisplay>

        <JumpButton
          onClick={(e) => {
            e.stopPropagation();
            setShowJump(!showJump);
            setShowCalendar(false);
          }}
        >
          <CalendarIcon size={18} />
          Jump To
        </JumpButton>

        <AnimatePresence>
          {showCalendar && (
            <CalendarOverlay
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <Calendar
                minDate={new Date(accStart)}
                maxDate={new Date(new Date().getTime())}
                value={date}
                onChange={(value) => {
                  setDate(new Date(new Date(value).getTime() + istOffset));
                  setShowCalendar(false);
                }}
              />
            </CalendarOverlay>
          )}

          {showJump && (
            <JumpMenu
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <JumpMenuItem
                onClick={() => {
                  setShowCalendar(true);
                  setShowJump(false);
                }}
              >
                <CalendarIcon size={16} />
                Select on Calendar
              </JumpMenuItem>
              <JumpMenuItem
                onClick={() => {
                  setDate(new Date(now));
                  setShowJump(false);
                }}
              >
                <Clock size={16} />
                Today
              </JumpMenuItem>
              <JumpMenuItem
                onClick={() => {
                  setDate(new Date(accStart));
                  setShowJump(false);
                }}
              >
                <CalendarIcon size={16} />
                Academic Start
              </JumpMenuItem>
            </JumpMenu>
          )}
        </AnimatePresence>
      </DateNavContainer>

      {loading ? (
        <LoadingSpinner animate={{ y: 0.1 }} exit={{ opacity: 0 }}>
          <div className="spinner" />
        </LoadingSpinner>
      ) : (
        <>
          {attendanceState &&
            attendanceState.some((course) => course.pending > 0) && (
              <WarningButton
                onClick={() => {
                  // Navigate to the first course with pending attendance
                  const courseWithPending = attendanceState.find(
                    (course) => course.pending > 0
                  );

                  if (courseWithPending) {
                    const firstPendingSlot = day.find(
                      (slot) => slot.courseId === courseWithPending.courseId
                    );

                    if (firstPendingSlot) {
                      handleSubjectSelect(firstPendingSlot.slotId);
                    }
                  }
                }}
              >
                <AlertTriangle size={16} />
                You have pending attendance to mark
              </WarningButton>
            )}
          <ContentContainer>
            <ScheduleContainer>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <ClassesGrid>
                  {day.length > 0 && attendanceState
                    ? day.map((ele) => {
                        // Find course data from attendanceState
                        const courseData = attendanceState.find(
                          (course) => course.courseId === ele.courseId
                        );
                        const hasPending = courseData && courseData.pending > 0;
                        const attendancePercent = courseData
                          ? courseData.attendancePercentage
                          : 0;
                        const minAttendance = courseData
                          ? courseData.minAttendance
                          : 85;

                        return (
                          <ClassCard
                            key={ele.slotId}
                            attendance={ele.attendance}
                            selected={subject && subject.slotId === ele.slotId}
                            onClick={() => handleSubjectSelect(ele.slotId)}
                            variants={staggerItem}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {courseData && (
                              <AttendanceTag
                                percentage={attendancePercent}
                                minAttendance={minAttendance}
                              >
                                {attendancePercent}%
                              </AttendanceTag>
                            )}

                            {hasPending && (
                              <WarningBadge>
                                <AlertTriangle size={12} />
                              </WarningBadge>
                            )}

                            <TimeDisplay>
                              <Clock size={12} />
                              {!ele.custom
                                ? (() => {
                                    const slot = timeSlots.find(
                                      (el) => el.slotId === ele.slotId
                                    );
                                    const start = slot.start;
                                    const end =
                                      ele.duration === 1
                                        ? slot.end
                                        : slot.end + 60;
                                    return `${formatMinutesFromMidnight(
                                      start
                                    )} - ${formatMinutesFromMidnight(end)}`;
                                  })()
                                : ele.display}
                            </TimeDisplay>
                            <CourseDisplay>{ele.courseId}</CourseDisplay>
                            {ele.attendance === "present" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  color: "#16a34a",
                                  marginTop: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                <Check size={12} />
                                Present
                              </motion.div>
                            )}
                            {ele.attendance === "absent" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  color: "#dc2626",
                                  marginTop: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                <X size={12} />
                                Absent
                              </motion.div>
                            )}
                            {ele.attendance === "ignore" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  color: "#64748b",
                                  marginTop: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                <AlertTriangle size={12} />
                                Ignored
                              </motion.div>
                            )}
                          </ClassCard>
                        );
                      })
                    : !loading && ( // Only show this message when not loading
                        <motion.div
                          variants={staggerItem}
                          style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "2rem",
                            color: "#64748b",
                          }}
                        >
                          No classes scheduled for this day.
                        </motion.div>
                      )}
                </ClassesGrid>
              </motion.div>

              <ActionBar>
                <ActionButton
                  variant="primary"
                  className={day.length == 0 && " opacity-45"}
                  style={{
                    cursor: day.length == 0 && "not-allowed",
                  }}
                  disabled={day.length == 0}
                  onClick={() => {
                    setShowDay(true);
                    setSubject(null);
                    setSubjectAdd(false);
                  }}
                >
                  Select Entire Day
                </ActionButton>

                <ActionButton
                  onClick={() => {
                    setSubject(null);
                    setShowDay(false);
                    setSubjectAdd(true);
                    setNewSubject({
                      courseId: courses[0]?.name,
                      startTime: "09:00",
                      endTime: "10:00",
                      attendance: "pending",
                    });
                  }}
                >
                  <PlusCircle size={18} />
                  Add Class
                </ActionButton>
              </ActionBar>
            </ScheduleContainer>

            <AnimatePresence mode="wait">
              {subjectAdd && !isMobile && (
                <>
                  <DetailPanel
                    onClick={(e) => e.stopPropagation()}
                    key="add-subject"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={panelVariants}
                  >
                    <DetailHeader>
                      <DetailTitle>Add Custom Class</DetailTitle>
                      <CloseButton onClick={() => setSubjectAdd(false)}>
                        <X size={20} />
                      </CloseButton>
                    </DetailHeader>

                    <FormGroup>
                      <Label>Course</Label>
                      <Select
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
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Time Range</Label>
                      <TimeRangeContainer>
                        <TimeInput
                          type="time"
                          value={newSubject.startTime}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              startTime: e.target.value,
                            })
                          }
                        />
                        <span>to</span>
                        <TimeInput
                          type="time"
                          value={newSubject.endTime}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </TimeRangeContainer>
                    </FormGroup>

                    <ButtonGroup>
                      <Button onClick={() => setSubjectAdd(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={addCustomSubject}>
                        Add Class
                      </Button>
                    </ButtonGroup>
                  </DetailPanel>
                </>
              )}

              {subject && !isMobile && (
                <DetailPanel
                  onClick={(e) => e.stopPropagation()}
                  key="edit-subject"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={panelVariants}
                >
                  <DetailHeader>
                    <DetailTitle>Edit Attendance</DetailTitle>
                    <CloseButton
                      onClick={() => {
                        setDay(JSON.parse(JSON.stringify(dayCache)));
                        setSubject(null);
                      }}
                    >
                      <X size={20} />
                    </CloseButton>
                  </DetailHeader>

                  <FormGroup>
                    <Label>Course</Label>
                    <Select
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
                    </Select>
                  </FormGroup>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <FormGroup style={{ flex: 1 }}>
                      <Label>Time</Label>
                      <div
                        style={{
                          padding: "0.75rem",
                          backgroundColor: `${
                            localStorage.getItem("theme") === "dark"
                              ? ""
                              : "#f8fafc"
                          }`,
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Clock size={16} />
                        {subject.display}
                      </div>
                    </FormGroup>
                  </div>

                  <IgnoreContainer>
                    <Checkbox
                      type="checkbox"
                      checked={subject.attendance === "ignore"}
                      onChange={(e) => {
                        setDay((prev) => {
                          return prev.map((item) => {
                            if (item.slotId === subject.slotId) {
                              return {
                                ...item,
                                attendance: e.target.checked
                                  ? "ignore"
                                  : "pending",
                              };
                            }
                            return item;
                          });
                        });

                        setSubject((prev) => ({
                          ...prev,
                          attendance: e.target.checked ? "ignore" : "pending",
                        }));
                      }}
                    />
                    <span>Ignore this class (holiday, cancelled, etc.)</span>
                  </IgnoreContainer>
                  {subject.custom && (
                    <IgnoreContainer
                      onClick={() => {
                        handleSubjectDelete();
                      }}
                      style={{ cursor: "pointer", color: "#ef4444" }}
                    >
                      <Trash2 size={16} />
                      <span>Delete this class</span>
                    </IgnoreContainer>
                  )}
                  <AttendanceOptionsContainer>
                    <Label>Attendance Status</Label>
                    <AttendanceOption>
                      <OptionButton
                        status="present"
                        disabled={subject.attendance === "ignore"}
                        onClick={() => {
                          if (subject.attendance !== "ignore") {
                            setDay((prev) => {
                              return prev.map((item) => {
                                if (item.slotId === subject.slotId) {
                                  return {
                                    ...item,
                                    attendance: "present",
                                  };
                                }
                                return item;
                              });
                            });

                            setSubject((prev) => ({
                              ...prev,
                              attendance: "present",
                            }));
                          }
                        }}
                      >
                        <Check size={16} />
                        Present
                      </OptionButton>

                      <OptionButton
                        status="absent"
                        disabled={subject.attendance === "ignore"}
                        onClick={() => {
                          if (subject.attendance !== "ignore") {
                            setDay((prev) => {
                              return prev.map((item) => {
                                if (item.slotId === subject.slotId) {
                                  return {
                                    ...item,
                                    attendance: "absent",
                                  };
                                }
                                return item;
                              });
                            });

                            setSubject((prev) => ({
                              ...prev,
                              attendance: "absent",
                            }));
                          }
                        }}
                      >
                        <X size={16} />
                        Absent
                      </OptionButton>
                    </AttendanceOption>
                  </AttendanceOptionsContainer>

                  {(subject.attendance === "ignore" ||
                    subject.attendance === "absent") && (
                    <FormGroup>
                      <Label>Reason</Label>
                      <TextArea
                        value={description}
                        onChange={(e) => {
                          if (!(e.target.value.length > 100)) {
                            setDescription(e.target.value);
                            setDay((prev) => {
                              return prev.map((item) => {
                                if (item.slotId === subject.slotId) {
                                  return {
                                    ...item,
                                    description: e.target.value,
                                  };
                                }
                                return item;
                              });
                            });
                          } else {
                            toast.info("Reason exceeded 100 characters");
                          }
                        }}
                        placeholder="Add reason for this class..."
                      />
                    </FormGroup>
                  )}

                  <ButtonGroup>
                    <Button
                      onClick={() => {
                        // Restore the original data from dayCache
                        setDay(JSON.parse(JSON.stringify(dayCache)));
                        setSubject(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        saveAttendanceState();
                        setSubject(null);
                      }}
                    >
                      Save
                    </Button>
                  </ButtonGroup>
                </DetailPanel>
              )}

              {showDay && !isMobile && (
                <DetailPanel
                  onClick={(e) => e.stopPropagation()}
                  key="edit-day"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={panelVariants}
                >
                  <DetailHeader>
                    <DetailTitle>Entire Day Attendance</DetailTitle>
                    <CloseButton
                      onClick={() => {
                        setDay(JSON.parse(JSON.stringify(dayCache)));
                        setShowDay(false);
                      }}
                    >
                      <X size={20} />
                    </CloseButton>
                  </DetailHeader>

                  <FormGroup>
                    <Label>Date</Label>
                    <div
                      style={{
                        padding: "0.75rem",
                        backgroundColor: `${
                          localStorage.getItem("theme") === "dark"
                            ? ""
                            : "#f8fafc"
                        }`,
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <CalendarIcon size={16} />
                      {d.format(date, "dddd, MMMM DD, YYYY")}
                    </div>
                  </FormGroup>

                  <AttendanceOptionsContainer>
                    <Label>Set All Classes</Label>
                    <IgnoreContainer>
                      <Checkbox
                        checked={day.every(
                          (ele) => ele.attendance === "ignore"
                        )}
                        type="checkbox"
                        onClick={(e) => {
                          if (e.target.checked) {
                            setDay((prev) => {
                              return prev.map((e) => ({
                                ...e,
                                attendance: "ignore",
                              }));
                            });
                          } else {
                            setDay((prev) => {
                              return prev.map((e) => ({
                                ...e,
                                attendance: "pending",
                              }));
                            });
                          }
                        }}
                      />
                      <span>Ignore this day (holiday, cancelled, etc.)</span>
                    </IgnoreContainer>
                    <AttendanceOption>
                      <OptionButton
                        status="present"
                        checked={day.every(
                          (ele) => ele.attendance === "present"
                        )}
                        onClick={() => {
                          setDay((prev) => {
                            return prev.map((item) => {
                              if (item.attendance !== "ignore") {
                                return {
                                  ...item,
                                  attendance: "present",
                                };
                              }
                              return item;
                            });
                          });
                        }}
                      >
                        <Check size={16} />
                        All Present
                      </OptionButton>

                      <OptionButton
                        status="absent"
                        checked={day.every(
                          (ele) => ele.attendance === "absent"
                        )}
                        onClick={() => {
                          setDay((prev) => {
                            return prev.map((item) => {
                              if (item.attendance !== "ignore") {
                                return {
                                  ...item,
                                  attendance: "absent",
                                };
                              }
                              return item;
                            });
                          });
                        }}
                      >
                        <X size={16} />
                        All Absent
                      </OptionButton>
                    </AttendanceOption>
                  </AttendanceOptionsContainer>

                  {(day.filter((ele) => ele.attendance === "absent").length ===
                    day.length ||
                    day.filter((ele) => ele.attendance === "ignore").length ===
                      day.length) && (
                    <FormGroup>
                      <Label>Reason</Label>
                      <TextArea
                        value={description}
                        onChange={(e) => {
                          if (!(e.target.value > 100)) {
                            setDescription(e.target.value);
                            setDay((prev) => {
                              return prev.map((item) => {
                                return {
                                  ...item,
                                  description: e.target.value,
                                };
                              });
                            });
                          } else {
                            toast.info("Reason exceeded 100 characters");
                          }
                        }}
                        placeholder="Add reason for this day..."
                      />
                    </FormGroup>
                  )}

                  <ButtonGroup>
                    <Button
                      onClick={() => {
                        // Restore the original data from dayCache
                        setDay(JSON.parse(JSON.stringify(dayCache)));
                        setShowDay(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        saveAttendanceState();
                        setShowDay(false);
                      }}
                    >
                      Save Day
                    </Button>
                  </ButtonGroup>
                </DetailPanel>
              )}
              {subjectAdd && isMobile && (
                <MobilePopup
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MobilePopupContent
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                  >
                    <MobilePopupHeader>
                      <PopupTitle>Add Custom Class</PopupTitle>
                      <CloseButton onClick={() => setSubjectAdd(false)}>
                        <X size={20} />
                      </CloseButton>
                    </MobilePopupHeader>

                    <FormGroup>
                      <Label>Course</Label>
                      <Select
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
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Time Range</Label>
                      <TimeRangeContainer>
                        <TimeInput
                          type="time"
                          value={newSubject.startTime}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              startTime: e.target.value,
                            })
                          }
                        />
                        <span>to</span>
                        <TimeInput
                          type="time"
                          value={newSubject.endTime}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </TimeRangeContainer>
                    </FormGroup>

                    <ButtonGroup>
                      <Button onClick={() => setSubjectAdd(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={addCustomSubject}>
                        Add Class
                      </Button>
                    </ButtonGroup>
                  </MobilePopupContent>
                </MobilePopup>
              )}

              {subject && isMobile && (
                <MobilePopup
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MobilePopupContent
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                  >
                    <MobilePopupHeader>
                      <PopupTitle>Edit Attendance</PopupTitle>
                      <CloseButton
                        onClick={() => {
                          setDay(JSON.parse(JSON.stringify(dayCache)));
                          setSubject(null);
                        }}
                      >
                        <X size={20} />
                      </CloseButton>
                    </MobilePopupHeader>

                    <FormGroup>
                      <Label>Course</Label>
                      <Select
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
                      </Select>
                    </FormGroup>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <FormGroup style={{ flex: 1 }}>
                        <Label>Time</Label>
                        <div
                          style={{
                            padding: "0.75rem",
                            backgroundColor: `${
                              localStorage.getItem("theme") === "dark"
                                ? ""
                                : "#f8fafc"
                            }`,
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Clock size={16} />
                          {subject.display}
                        </div>
                      </FormGroup>
                    </div>

                    <IgnoreContainer>
                      <Checkbox
                        type="checkbox"
                        checked={subject.attendance === "ignore"}
                        onChange={(e) => {
                          setDay((prev) => {
                            return prev.map((item) => {
                              if (item.slotId === subject.slotId) {
                                return {
                                  ...item,
                                  attendance: e.target.checked
                                    ? "ignore"
                                    : "pending",
                                };
                              }
                              return item;
                            });
                          });

                          setSubject((prev) => ({
                            ...prev,
                            attendance: e.target.checked ? "ignore" : "pending",
                          }));
                        }}
                      />
                      <span>Ignore this class (holiday, cancelled, etc.)</span>
                    </IgnoreContainer>
                    {subject.custom && (
                      <IgnoreContainer
                        onClick={() => {
                          handleSubjectDelete();
                        }}
                        style={{ cursor: "pointer", color: "#ef4444" }}
                      >
                        <Trash2 size={16} />
                        <span>Delete this class</span>
                      </IgnoreContainer>
                    )}
                    <AttendanceOptionsContainer>
                      <Label>Attendance Status</Label>
                      <AttendanceOption className={"mb-10"}>
                        <OptionButton
                          status="present"
                          disabled={subject.attendance === "ignore"}
                          onClick={() => {
                            if (subject.attendance !== "ignore") {
                              setDay((prev) => {
                                return prev.map((item) => {
                                  if (item.slotId === subject.slotId) {
                                    return {
                                      ...item,
                                      attendance: "present",
                                    };
                                  }
                                  return item;
                                });
                              });

                              setSubject((prev) => ({
                                ...prev,
                                attendance: "present",
                              }));
                            }
                          }}
                        >
                          <Check size={16} />
                          Present
                        </OptionButton>

                        <OptionButton
                          status="absent"
                          disabled={subject.attendance === "ignore"}
                          onClick={() => {
                            if (subject.attendance !== "ignore") {
                              setDay((prev) => {
                                return prev.map((item) => {
                                  if (item.slotId === subject.slotId) {
                                    return {
                                      ...item,
                                      attendance: "absent",
                                    };
                                  }
                                  return item;
                                });
                              });

                              setSubject((prev) => ({
                                ...prev,
                                attendance: "absent",
                              }));
                            }
                          }}
                        >
                          <X size={16} />
                          Absent
                        </OptionButton>
                      </AttendanceOption>
                    </AttendanceOptionsContainer>

                    {(subject.attendance === "ignore" ||
                      subject.attendance === "absent") && (
                      <FormGroup className={"mb-10"}>
                        <Label>Reason</Label>
                        <TextArea
                          value={description}
                          onChange={(e) => {
                            if (!(e.target.value > 100)) {
                              setDescription(e.target.value);
                              setDay((prev) => {
                                return prev.map((item) => {
                                  if (item.slotId === subject.slotId) {
                                    return {
                                      ...item,
                                      description: e.target.value,
                                    };
                                  }
                                  return item;
                                });
                              });
                            } else {
                              toast.info("Reason exceeded 100 characters");
                            }
                          }}
                          placeholder="Add reason for this class..."
                        />
                      </FormGroup>
                    )}

                    <ButtonGroup>
                      <Button
                        onClick={() => {
                          // Restore the original data from dayCache
                          setDay(JSON.parse(JSON.stringify(dayCache)));
                          setSubject(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          saveAttendanceState();
                          setSubject(null);
                        }}
                      >
                        Save
                      </Button>
                    </ButtonGroup>
                  </MobilePopupContent>
                </MobilePopup>
              )}

              {showDay && isMobile && (
                <MobilePopup
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MobilePopupContent
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                  >
                    <MobilePopupHeader>
                      <PopupTitle>Entire Day Attendance</PopupTitle>
                      <CloseButton
                        onClick={() => {
                          setDay(JSON.parse(JSON.stringify(dayCache)));
                          setShowDay(false);
                        }}
                      >
                        <X size={20} />
                      </CloseButton>
                    </MobilePopupHeader>

                    <FormGroup>
                      <Label>Date</Label>
                      <div
                        style={{
                          padding: "0.75rem",
                          backgroundColor: `${
                            localStorage.getItem("theme") === "dark"
                              ? ""
                              : "#f8fafc"
                          }`,
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <CalendarIcon size={16} />
                        {d.format(date, "dddd, MMMM DD, YYYY")}
                      </div>
                    </FormGroup>

                    <AttendanceOptionsContainer>
                      <Label>Set All Classes</Label>
                      <IgnoreContainer>
                        <Checkbox
                          checked={day.every(
                            (ele) => ele.attendance === "ignore"
                          )}
                          type="checkbox"
                          onClick={(e) => {
                            if (e.target.checked) {
                              setDay((prev) => {
                                return prev.map((e) => ({
                                  ...e,
                                  attendance: "ignore",
                                }));
                              });
                            } else {
                              setDay((prev) => {
                                return prev.map((e) => ({
                                  ...e,
                                  attendance: "pending",
                                }));
                              });
                            }
                          }}
                        />
                        <span>Ignore this day (holiday, cancelled, etc.)</span>
                      </IgnoreContainer>
                      <AttendanceOption className={"mb-10"}>
                        <OptionButton
                          status="present"
                          checked={day.every(
                            (ele) => ele.attendance === "present"
                          )}
                          onClick={() => {
                            setDay((prev) => {
                              return prev.map((item) => {
                                if (item.attendance !== "ignore") {
                                  return {
                                    ...item,
                                    attendance: "present",
                                  };
                                }
                                return item;
                              });
                            });
                          }}
                        >
                          <Check size={16} />
                          All Present
                        </OptionButton>

                        <OptionButton
                          status="absent"
                          checked={day.every(
                            (ele) => ele.attendance === "absent"
                          )}
                          onClick={() => {
                            setDay((prev) => {
                              return prev.map((item) => {
                                if (item.attendance !== "ignore") {
                                  return {
                                    ...item,
                                    attendance: "absent",
                                  };
                                }
                                return item;
                              });
                            });
                          }}
                        >
                          <X size={16} />
                          All Absent
                        </OptionButton>
                      </AttendanceOption>
                    </AttendanceOptionsContainer>

                    {(day.filter((ele) => ele.attendance === "absent")
                      .length === day.length ||
                      day.filter((ele) => ele.attendance === "ignore")
                        .length === day.length) && (
                      <FormGroup className={"mb-10"}>
                        <Label>Reason</Label>
                        <TextArea
                          value={description}
                          onChange={(e) => {
                            if (!(e.target.value > 100)) {
                              setDescription(e.target.value);
                              setDay((prev) => {
                                return prev.map((item) => {
                                  return {
                                    ...item,
                                    description: e.target.value,
                                  };
                                });
                              });
                            } else {
                              toast.info("Reason exceeded 100 characters");
                            }
                          }}
                          placeholder="Add reason for this day..."
                          maxLength={100}
                        />
                      </FormGroup>
                    )}

                    <ButtonGroup>
                      <Button
                        onClick={() => {
                          // Restore the original data from dayCache
                          setDay(JSON.parse(JSON.stringify(dayCache)));
                          setShowDay(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          saveAttendanceState();
                          setShowDay(false);
                        }}
                      >
                        Save Day
                      </Button>
                    </ButtonGroup>
                  </MobilePopupContent>
                </MobilePopup>
              )}
            </AnimatePresence>
          </ContentContainer>
        </>
      )}
    </Card>
  );
};

export default MainAttendance;
