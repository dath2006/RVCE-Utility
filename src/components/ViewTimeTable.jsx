import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Calendar, ArrowRight } from "lucide-react";
import { Clock, GraduationCap, User } from "lucide-react";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const TimetableContainer = styled.div`
  max-width: 1200px;
  padding: 1rem;
  border-radius: 10px;
  color: ${(props) => props.theme.text};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  scale: 0.9;

  @media (max-width: 768px) {
    margin-top: 3rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(5, minmax(150px, 1fr));
  gap: 1px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  overflow: hidden;
  min-width: 800px; // Reduced from 900px to allow better fit on smaller screens

  @media (max-width: 1024px) {
    grid-template-columns: 100px repeat(5, minmax(120px, 1fr));
  }
`;

const HeaderCell = styled.div`
  background-color: #1e293b;
  color: white;
  padding: 1rem;
  font-weight: 600;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TimeCell = styled.div`
  background-color: ${(props) => props.theme.cardTheme};
  padding: 1rem 0.5rem;
  border-right: 1px solid #e2e8f0;
  font-size: 0.875rem;
  text-align: center;
  position: sticky;
  left: 0;
  z-index: 5;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyCell = styled.div`
  background-color: white;
  min-height: 100px;
  grid-row: span 1;

  @media (max-width: 1024px) {
    min-height: 80px;
  }
`;

const StyledEventCard = styled(motion.div)`
  background-color: ${({ $type }) =>
    $type === "theory" ? "#dbeafe" : $type === "lab" ? "#dcfce7" : "#fef3c7"};
  border-radius: 6px;
  padding: 0.75rem;
  grid-row: span ${({ $duration }) => $duration};
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 0.5rem;
  }
`;

const ScrollIndicator = styled.div`
  display: none;
  text-align: center;
  padding: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;

  @media (max-width: 1024px) {
    display: block;
  }
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

function TimeTable() {
  const [timetable, setTimeTable] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlotMatrix, setTimeSlotMatrix] = useState([]);
  const days = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    getTimeTable();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (timetable && timeSlots) {
      createTimeSlotMatrix();
    }
  }, [timetable, timeSlots]);

  const getTimeTable = async () => {
    try {
      if (isLoaded && isSignedIn) {
        setIsLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable?email=${
            user.primaryEmailAddress.emailAddress
          }`
        );

        if (res.data.timeTable) {
          setTimeTable(() => {
            return res.data.timeTable;
          });
          setTimeSlots(() => {
            const filteredSlots = res.data.timeTable.timeSlots.filter(
              (slot) => !slot.slotId.includes("break")
            );

            return filteredSlots;
          });
        } else {
          toast.error("Error fetching timetable !");
        }
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Error fetching timetable !");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a grid matrix for proper event placement
  const createTimeSlotMatrix = () => {
    if (!timetable || !timeSlots) {
      toast.info("No timetable or timeSlots data available");
      return [];
    }

    // Initialize the matrix with empty rows for all time slots
    const matrix = timeSlots.map(() => Array(5).fill({ event: null, span: 1 }));

    // Fill in the events
    timeSlots.forEach((slot, slotIndex) => {
      timetable.events?.forEach((event) => {
        if (event.slotId === slot.slotId) {
          // Set the current slot
          matrix[slotIndex][event.dayIndex] = { event, span: event.duration };

          // If this is a multi-period event, mark subsequent slots
          if (event.duration > 1) {
            for (
              let i = 1;
              i < event.duration && slotIndex + i < timeSlots.length;
              i++
            ) {
              matrix[slotIndex + i][event.dayIndex] = { event: null, span: 0 };
            }
          }
        }
      });
    });
    console.log(matrix);

    setTimeSlotMatrix(matrix);
  };

  return isLoading ? (
    <LoadingSpinner>
      <div className="spinner" />
    </LoadingSpinner>
  ) : (
    <TimetableContainer className={"w-full "}>
      <div className="flex items-center gap-3 mb-6 px-2">
        <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        <h1 className="text-xl md:text-2xl font-bold ">
          Interactive Timetable
        </h1>
      </div>

      <ScrollIndicator>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <ArrowRight size={16} />
          <span>Scroll horizontally to view full timetable</span>
        </div>
      </ScrollIndicator>

      <Grid>
        {days.map((day) => (
          <HeaderCell key={day}>{day}</HeaderCell>
        ))}

        {timeSlots.map((slot, rowIndex) => (
          <React.Fragment key={slot.slotId}>
            <TimeCell>{slot.display}</TimeCell>
            {timeSlotMatrix[rowIndex]?.map((cell, dayIndex) => {
              if (!cell || cell.span === 0) return null; // Skip cells that are part of a multi-period event

              if (!cell.event) {
                return <EmptyCell key={`empty-${dayIndex}-${slot.id}`} />;
              }

              const course = timetable.courses.find(
                (c) => c.name === cell.event.courseId
              );
              if (!course)
                return <EmptyCell key={`empty-${dayIndex}-${slot.slotId}`} />;

              return (
                <EventCard
                  key={`${cell.event.day}-${cell.event.slotId}`}
                  event={cell.event}
                  course={course}
                />
              );
            })}
          </React.Fragment>
        ))}
      </Grid>
    </TimetableContainer>
  );
}

const EventCard = ({ event, course }) => {
  return (
    <StyledEventCard $duration={event.duration} $type={course.type}>
      <div className="flex flex-col h-full">
        <div className="font-semibold text-sm md:text-base text-gray-900">
          {course.name}
        </div>
        <div className="text-xs text-gray-600 line-clamp-1">
          {course.fullName}
        </div>
        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User size={12} />
            <span className="line-clamp-1">{course.instructor}</span>
          </div>
          {course.type === "lab" && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <GraduationCap size={12} />
              <span>Lab Session</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={12} />
            <span>
              {event.duration > 1 ? "Double Period" : "Single Period"}
            </span>
          </div>
        </div>
      </div>
    </StyledEventCard>
  );
};

export default TimeTable;
