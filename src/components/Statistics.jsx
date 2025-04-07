import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Percent,
  Calendar,
  Check,
  X,
  Clock,
  Edit2,
} from "lucide-react";
import {
  Box,
  Typography,
  Slider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

// Styled Components
const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
`;

const OverallStatsCard = styled(motion.div)`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  text-align: center;

  h3 {
    font-size: 28px;
    font-weight: 700;
    margin: 8px 0 4px;
  }

  p {
    font-size: 12px;
    margin: 0;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const MainHeading = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const SubjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubjectCard = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SubjectHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: ${(props) => (props.expanded ? "1px solid #e5e7eb" : "none")};
`;

const SubjectTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const AttendanceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PercentBadge = styled.span`
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  background-color: ${(props) => {
    if (props.pending > 0) return "#f59e0b";
    if (props.percentage >= props.minimum) return "#10b981";
    return "#ef4444";
  }};
  color: white;
`;

const WarningBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 12px;
  padding: 4px 8px;
  background-color: ${(props) =>
    props.type === "warning" ? "#fef3c7" : "#fee2e2"};
  color: ${(props) => (props.type === "warning" ? "#d97706" : "#b91c1c")};
`;

const SubjectDetails = styled(motion.div)`
  padding: 0;
  overflow: hidden;
`;

const DetailContent = styled.div`
  padding: 16px 20px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  text-align: center;

  h4 {
    font-size: 20px;
    font-weight: 600;
    margin: 4px 0;
    color: #111827;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const WarningText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.type === "warning" ? "#fef3c7" : "#fee2e2"};
  color: ${(props) => (props.type === "warning" ? "#d97706" : "#b91c1c")};
  font-size: 14px;
`;

const MinAttendanceSetter = styled.div`
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
`;

const ButtonStyle = styled.button`
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

// Main Component
const Statistics = () => {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [customMinAttendance, setCustomMinAttendance] = useState({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          setLoading(true);
          const data = await handleGetStats();

          if (data && data.attendanceState) {
            const initialMinAttendance = {};
            data.attendanceState.forEach((subject) => {
              initialMinAttendance[subject.courseId] = subject.minAttendance;
            });

            setAttendanceData(data); // Simplified - just pass the data directly
            setCustomMinAttendance(initialMinAttendance);
          } else {
            setAttendanceData(null);
          }
        } catch (error) {
          toast.error("Error fetching statistics");
          console.error("Error in fetchData:", error);
          setAttendanceData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isLoading, isAuthenticated]);

  const handleGetStats = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/attendance/statistics?email=${
          user.email
        }`
      );
      if (res.data.success) {
        return res.data.data;
      } else {
        toast.error("Error fetching Stats");
      }
    } catch (error) {
      toast.error("Error fetching Stats");
      console.error("Error fetching stats:", error);
      return null;
    }
  };

  // Function to handle custom min attendance update
  const handleMinAttendanceUpdate = async (courseId) => {
    try {
      setLoading(true); // Use the existing loading state
      if (!isLoading && isAuthenticated) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/attendance/updatePercent`, // Fixed the backtick
          {
            email: user.email,
            courseId,
            percentage: customMinAttendance[courseId],
          }
        );

        if (res.data.success) {
          toast.success("Minimum Attendance Updated");
          const data = await handleGetStats();
          if (data && data.attendanceState) {
            const initialMinAttendance = {};
            data.attendanceState.forEach((subject) => {
              initialMinAttendance[subject.courseId] = subject.minAttendance;
            });
            setAttendanceData(data);
            setCustomMinAttendance(initialMinAttendance);
          }
        } else {
          toast.error("Error updating minimum attendance!");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating minimum attendance!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded subject
  const toggleSubject = (courseId) => {
    setExpandedSubject(expandedSubject === courseId ? null : courseId);
  };

  return loading ? (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingText>Loading attendance statistics...</LoadingText>
    </LoadingContainer>
  ) : attendanceData ? (
    <DashboardContainer>
      <MainHeading>Attendance Dashboard</MainHeading>

      {/* Overall Stats */}
      <OverallStatsCard
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-2">Overall Attendance</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-3xl font-bold">
            {attendanceData.overallAttendanceState.attendancePercent}%
          </div>
          {attendanceData.overallAttendanceState.attendancePercent < 85 && (
            <WarningBadge type="error">
              <AlertTriangle size={12} />
              Below required
            </WarningBadge>
          )}
          {attendanceData.overallAttendanceState.pending > 0 && (
            <WarningBadge type="warning">
              <Clock size={12} />
              {attendanceData.overallAttendanceState.pending} pending
            </WarningBadge>
          )}
        </div>

        <StatsGrid>
          <StatBox>
            <Check size={16} />
            <h3>{attendanceData.overallAttendanceState.present}</h3>
            <p>Present</p>
          </StatBox>
          <StatBox>
            <X size={16} />
            <h3>{attendanceData.overallAttendanceState.absent}</h3>
            <p>Absent</p>
          </StatBox>
          <StatBox>
            <Clock size={16} />
            <h3>{attendanceData.overallAttendanceState.pending}</h3>
            <p>Pending</p>
          </StatBox>
          <StatBox>
            <Calendar size={16} />
            <h3>
              {attendanceData.overallAttendanceState.totalClasses -
                attendanceData.overallAttendanceState.ignore}
            </h3>
            <p>Total Classes</p>
          </StatBox>
        </StatsGrid>
      </OverallStatsCard>

      {/* Subject-wise Stats */}
      <SubjectsList>
        {attendanceData.attendanceState.map((subject, index) => {
          const effectiveTotalClasses = subject.totalClasses - subject.ignore;

          return (
            <motion.div
              key={subject.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <SubjectCard>
                <SubjectHeader
                  expanded={expandedSubject === subject.courseId}
                  onClick={() => toggleSubject(subject.courseId)}
                >
                  <SubjectTitle>{subject.courseId}</SubjectTitle>
                  <AttendanceIndicator>
                    {subject.pending > 0 && (
                      <WarningBadge type="warning">
                        <Clock size={12} />
                        {subject.pending} pending
                      </WarningBadge>
                    )}

                    {!subject.isEligible && subject.pending === 0 && (
                      <WarningBadge type="error">
                        <AlertTriangle size={12} />
                        Not eligible
                      </WarningBadge>
                    )}

                    <PercentBadge
                      percentage={subject.attendancePercentage}
                      minimum={subject.minAttendance}
                      pending={subject.pending}
                    >
                      {subject.attendancePercentage}%
                    </PercentBadge>

                    {expandedSubject === subject.courseId ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </AttendanceIndicator>
                </SubjectHeader>

                <AnimatePresence>
                  {expandedSubject === subject.courseId && (
                    <SubjectDetails
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DetailContent>
                        <StatsRow>
                          <StatItem>
                            <Check
                              size={16}
                              className="mx-auto text-green-500"
                            />
                            <h4>{subject.present}</h4>
                            <p>Present</p>
                          </StatItem>
                          <StatItem>
                            <X size={16} className="mx-auto text-red-500" />
                            <h4>{subject.absent}</h4>
                            <p>Absent</p>
                          </StatItem>
                          <StatItem>
                            <Calendar
                              size={16}
                              className="mx-auto text-blue-500"
                            />
                            <h4>{effectiveTotalClasses}</h4>
                            <p>Total Classes</p>
                          </StatItem>
                        </StatsRow>

                        <StatsRow>
                          <StatItem>
                            <Percent
                              size={16}
                              className="mx-auto text-purple-500"
                            />
                            <h4>{subject.minAttendance}%</h4>
                            <p>Required</p>
                          </StatItem>
                          <StatItem>
                            <Award
                              size={16}
                              className={`mx-auto ${
                                subject.isEligible
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <h4>{subject.isEligible ? "Yes" : "No"}</h4>
                            <p>Eligible</p>
                          </StatItem>
                          {subject.classCount.requiredPresent !== undefined && (
                            <StatItem>
                              <Bell
                                size={16}
                                className="mx-auto text-yellow-500"
                              />
                              <h4>{subject.classCount.requiredPresent}</h4>
                              <p>Required Present</p>
                            </StatItem>
                          )}
                          {subject.classCount.allowedAbsent !== undefined && (
                            <StatItem>
                              <AlertTriangle
                                size={16}
                                className="mx-auto text-orange-500"
                              />
                              <h4>{subject.classCount.allowedAbsent}</h4>
                              <p>Allowed Absent</p>
                            </StatItem>
                          )}
                        </StatsRow>

                        {/* Warnings Section */}
                        {subject.pending > 0 && (
                          <WarningText type="warning">
                            <Clock size={16} />
                            Attendance percentage may not be accurate. Please
                            clear the pending attendance.
                          </WarningText>
                        )}

                        {!subject.isEligible && subject.pending === 0 && (
                          <WarningText type="error">
                            <AlertTriangle size={16} />
                            Your attendance is below the minimum requirement of{" "}
                            {subject.minAttendance}%.
                            {subject.classCount.requiredPresent !=
                              undefined && (
                              <span>
                                {" "}
                                You need to attend at least{" "}
                                {subject.classCount.requiredPresent} more
                                classes to be eligible.
                              </span>
                            )}
                          </WarningText>
                        )}

                        {/* Custom Min Attendance Setter */}
                        <MinAttendanceSetter>
                          <h4 className="text-sm font-medium mb-2 text-gray-700">
                            Set Custom Minimum Attendance
                          </h4>
                          <Box
                            sx={{
                              width: "100%",
                              px: isSmallMobile ? 1 : 2,
                              py: 1,
                            }}
                          >
                            <Slider
                              value={customMinAttendance[subject.courseId]}
                              onChange={(e) =>
                                setCustomMinAttendance({
                                  ...customMinAttendance,
                                  [subject.courseId]:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              aria-labelledby="attendance-slider"
                              valueLabelDisplay="auto"
                              step={2}
                              marks
                              min={50}
                              max={100}
                              color="primary"
                              size={isMobile ? "small" : "medium"}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: isSmallMobile
                                    ? "0.65rem"
                                    : "inherit",
                                }}
                              >
                                50%
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: isSmallMobile
                                    ? "0.65rem"
                                    : "inherit",
                                }}
                              >
                                100%
                              </Typography>
                            </Box>
                          </Box>
                          <ButtonStyle
                            onClick={() =>
                              handleMinAttendanceUpdate(subject.courseId)
                            }
                          >
                            <Edit2 size={14} />
                            Update
                          </ButtonStyle>
                        </MinAttendanceSetter>
                      </DetailContent>
                    </SubjectDetails>
                  )}
                </AnimatePresence>
              </SubjectCard>
            </motion.div>
          );
        })}
      </SubjectsList>
    </DashboardContainer>
  ) : (
    <LoadingContainer>
      <LoadingText>No attendance data available.</LoadingText>
    </LoadingContainer>
  );
};

export default Statistics;
