import React from "react";
import styled from "styled-components";
import { Award, BarChart3, Download } from "lucide-react";

const Container = styled.div`
  background: ${(props) => props.theme.cardTheme};
  color: ${(props) => props.theme.text};
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid ${(props) => props.theme.border};
  padding: 24px;
  max-width: 672px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${(props) => props.theme.gradient};
  border-radius: 50%;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin: 0;
`;

const PendingWarning = styled.div`
  text-align: center;
  margin-bottom: 16px;

  p {
    font-size: 14px;
    color: #f59e0b;
    margin: 0;

    span {
      font-weight: 600;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StatCard = styled.div`
  background: ${(props) => props.theme.secondary};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.color || props.theme.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.text};
  opacity: 0.7;
`;

const ProgressBar = styled.div`
  width: 100%;
  background: ${(props) => props.theme.border};
  border-radius: 9999px;
  height: 8px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${(props) => props.color};
  border-radius: 9999px;
  transition: width 0.3s ease;
  width: ${(props) => props.width}%;
`;

const Summary = styled.div`
  text-center;
  margin-bottom: 24px;
  
  p {
    color: ${(props) => props.theme.text};
    opacity: 0.8;
    margin: 0;
    line-height: 1.6;
  }
`;

const Badge = styled.span`
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  background: ${(props) => props.color};
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: ${(props) => props.theme.primary};
  color: white;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${(props) => props.theme.shadowHover};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: ${(props) => props.theme.secondary};
  color: ${(props) => props.theme.primary};
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${(props) => props.theme.border};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const IconSpacing = styled.span`
  margin-right: 8px;
`;

export default function SemesterCompletionCard({
  overallAttendance,
  setActiveComponent,
}) {
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#3b82f6";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Container>
      <Header>
        <IconWrapper>
          <Award size={24} color="white" />
        </IconWrapper>
        <Title>Congratulations! 🎉</Title>
        <Subtitle>You have reached the end of the semester!</Subtitle>
      </Header>

      {overallAttendance?.pending > 0 && (
        <PendingWarning>
          <p>
            Attendance may not be correct due to{" "}
            <span>{overallAttendance.pending} pending classes</span>
          </p>
        </PendingWarning>
      )}

      <StatsGrid>
        <StatCard>
          <StatValue>
            {overallAttendance?.present || 0}/
            {overallAttendance?.totalClasses - overallAttendance?.ignore || 0}
          </StatValue>
          <StatLabel>Classes Attended</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue
            color={getAttendanceColor(
              overallAttendance?.attendancePercent || 0
            )}
          >
            {overallAttendance?.attendancePercent || 0}%
          </StatValue>
          <StatLabel>Attendance Rate</StatLabel>
          <ProgressBar>
            <ProgressFill
              color={getAttendanceColor(
                overallAttendance?.attendancePercent || 0
              )}
              width={overallAttendance?.attendancePercent || 0}
            />
          </ProgressBar>
        </StatCard>
      </StatsGrid>

      <Summary>
        <p>
          You have attended{" "}
          <Badge
            color={getAttendanceColor(
              overallAttendance?.attendancePercent || 0
            )}
          >
            {overallAttendance?.present || 0} /{" "}
            {overallAttendance?.totalClasses - overallAttendance?.ignore || 0}
          </Badge>{" "}
          classes with an overall attendance of{" "}
          <Badge
            color={getAttendanceColor(
              overallAttendance?.attendancePercent || 0
            )}
          >
            {overallAttendance?.attendancePercent || 0}%
          </Badge>
        </p>
      </Summary>

      <ActionButtons>
        <PrimaryButton onClick={() => setActiveComponent("statistics")}>
          <IconSpacing>
            <BarChart3 size={16} />
          </IconSpacing>
          View Statistics
        </PrimaryButton>

        <SecondaryButton onClick={() => setActiveComponent("import")}>
          <IconSpacing>
            <Download size={16} />
          </IconSpacing>
          Import New Semester
        </SecondaryButton>
      </ActionButtons>
    </Container>
  );
}
