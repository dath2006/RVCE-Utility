import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  GraduationCap,
  User,
} from "lucide-react";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

const Shell = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: ${(props) => props.theme.cardTheme};
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  overflow: visible;
`;

const Header = styled.div`
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  padding: 0.9rem 1rem;
  background: rgba(241, 245, 249, 0.65);

  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.48rem;
`;

const HeaderSub = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: ${(props) => props.theme.textLight};
`;

const ScrollHint = styled.div`
  display: none;
  margin-top: 0.6rem;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: ${(props) => props.theme.textLight};

  @media (max-width: 1024px) {
    display: inline-flex;
  }
`;

const ScrollViewport = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x pan-y;
  padding: 0;
  scrollbar-width: thin;
  position: relative;

  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.5);
    border-radius: 999px;
  }
`;

const TimetableContainer = styled.div`
  border-radius: 14px;
  color: ${(props) => props.theme.text};
  display: block;
  width: 860px;
  min-width: 860px;
  max-width: none;
  background: ${(props) => props.theme.background};
  border: 1px solid rgba(148, 163, 184, 0.25);
  overflow: visible;
  position: relative;

  @media (min-width: 1025px) {
    width: 920px;
    min-width: 920px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(5, minmax(145px, 1fr));
  gap: 1px;
  background: rgba(148, 163, 184, 0.2);
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 100px repeat(5, minmax(130px, 1fr));
  }
`;

const HeaderCell = styled.div`
  background: #0f172a;
  color: #f8fafc;
  padding: 0.8rem;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 8;

  &:first-child {
    left: 0;
    z-index: 10;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }
`;

const TimeCell = styled.div`
  background: ${(props) => props.theme.cardTheme};
  padding: 0.8rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  position: sticky;
  left: 0;
  z-index: 7;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 10px rgba(15, 23, 42, 0.1);
`;

const EmptyCell = styled.div`
  background: ${(props) => props.theme.background};
  min-height: 94px;
  grid-row: span 1;

  @media (max-width: 1024px) {
    min-height: 82px;
  }
`;

const StyledEventCard = styled(motion.div)`
  background: ${({ $type }) =>
    $type === "theory"
      ? "rgba(226, 232, 240, 0.65)"
      : $type === "lab"
        ? "rgba(220, 252, 231, 0.58)"
        : "rgba(254, 243, 199, 0.58)"};
  border-radius: 8px;
  padding: 0.62rem;
  grid-row: span ${({ $duration }) => $duration};
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 0.54rem;
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
  const { user, isLoading, isAuthenticated, getAccessTokenSilently } =
    useAuth0();
  const [loading, setLoading] = useState(false);
  const [timeSlotMatrix, setTimeSlotMatrix] = useState([]);
  const days = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getTimeTable = useCallback(async () => {
    try {
      if (!isLoading && isAuthenticated) {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.timeTable) {
          setTimeTable(() => {
            return res.data.timeTable;
          });
          setTimeSlots(() => {
            const filteredSlots = res.data.timeTable.timeSlots.filter(
              (slot) => !slot.slotId.includes("break"),
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
      setLoading(false);
    }
  }, [getAccessTokenSilently, isAuthenticated, isLoading, user?.email]);

  // Create a grid matrix for proper event placement
  const createTimeSlotMatrix = useCallback(() => {
    if (!timetable || !timeSlots) {
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

    setTimeSlotMatrix(matrix);
  }, [timeSlots, timetable]);

  useEffect(() => {
    getTimeTable();
  }, [getTimeTable]);

  useEffect(() => {
    if (timetable && timeSlots) {
      createTimeSlotMatrix();
    }
  }, [createTimeSlotMatrix, timetable, timeSlots]);

  return loading ? (
    <LoadingSpinner>
      <div className="spinner" />
    </LoadingSpinner>
  ) : (
    <Shell>
      <Header>
        <HeaderTitle>
          <CalendarDays size={17} />
          Weekly Timetable View
        </HeaderTitle>
        <HeaderSub>
          Live schedule with period durations and course details.
        </HeaderSub>
        <ScrollHint>
          <ArrowRight size={14} />
          Swipe horizontally on mobile to view full table
        </ScrollHint>
      </Header>

      <ScrollViewport>
        <TimetableContainer>
          <Grid>
            {days.map((day) => (
              <HeaderCell key={day}>{day}</HeaderCell>
            ))}

            {timeSlots.map((slot, rowIndex) => (
              <React.Fragment key={slot.slotId}>
                <TimeCell>{slot.display}</TimeCell>
                {timeSlotMatrix[rowIndex]?.map((cell, dayIndex) => {
                  if (!cell || cell.span === 0) return null;

                  if (!cell.event) {
                    return <EmptyCell key={`empty-${dayIndex}-${slot.id}`} />;
                  }

                  const course = timetable.courses.find(
                    (c) => c.name === cell.event.courseId,
                  );

                  if (!course) {
                    return (
                      <EmptyCell key={`empty-${dayIndex}-${slot.slotId}`} />
                    );
                  }

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
      </ScrollViewport>
    </Shell>
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

EventCard.propTypes = {
  event: PropTypes.shape({
    duration: PropTypes.number.isRequired,
  }).isRequired,
  course: PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    instructor: PropTypes.string,
  }).isRequired,
};

export default TimeTable;
