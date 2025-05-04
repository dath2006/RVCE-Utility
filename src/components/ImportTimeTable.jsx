import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

// Responsive breakpoints
const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

// Styled Components
const PageContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 10rem);
  // background: ${(props) => props.theme.background || "#f5f7fa"};
  padding: 1rem;
  border-radius: 2rem;
`;

const ContentCard = styled(motion.div)`
  background: ${(props) => props.theme.cardTheme || "#ffffff"};
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  color: ${(props) => props.theme.text || "#1a1d1f"};
  border: 1px solid ${(props) => props.theme.border || "#e2e8f0"};
  overflow: hidden;

  @media (max-width: ${breakpoints.xs}) {
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  background: ${(props) =>
    props.theme.gradient || "linear-gradient(135deg, #3b82f6, #6366f1)"};
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;

  @media (max-width: ${breakpoints.md}) {
    padding: 1rem 1.25rem;
  }
`;

const CardTitle = styled.h1`
  font-weight: 700;
  font-size: 1.75rem;
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: ${breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const CardContent = styled.div`
  padding: 2rem;

  @media (max-width: ${breakpoints.md}) {
    padding: 1.25rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    margin-bottom: 1.5rem;
  }
`;

const TabOption = styled(motion.div)`
  flex: 1;
  padding: 1.5rem;
  background: ${(props) =>
    props.active
      ? props.theme.primary || "#3b82f6"
      : props.theme.secondary || "#f1f5f9"};
  color: ${(props) =>
    props.active ? "#ffffff" : props.theme.text || "#1a1d1f"};
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  box-shadow: ${(props) =>
    props.active ? "0 4px 12px rgba(59, 130, 246, 0.2)" : "none"};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: ${breakpoints.md}) {
    padding: 1rem 0.75rem;
    border-radius: 8px;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 0.75rem 0.5rem;
  }

  @media (max-width: ${breakpoints.xs}) {
    padding: 0.5rem 0.25rem;
  }
`;

const TabIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.md}) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
`;

const TabTitle = styled.h3`
  margin: 0;
  font-weight: 600;
  font-size: 1.25rem;

  @media (max-width: ${breakpoints.md}) {
    font-size: 1rem;
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 0.875rem;
  }
`;

const FormSection = styled(motion.div)`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.theme.text || "#1a1d1f"};

  @media (max-width: ${breakpoints.md}) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
  }
`;

const SelectWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border || "#e2e8f0"};
  background: ${(props) => props.theme.background || "#ffffff"};
  color: ${(props) => props.theme.text || "#ffffff"};
  font-size: 1rem;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary || "#3b82f6"};
    box-shadow: 0 0 0 2px
      ${(props) => (props.theme.primary || "#3b82f6") + "33"};
  }

  /* Fix for dark mode: ensure option text is always readable */
  option {
    background-color: ${(props) => props.theme.cardTheme || "#ffffff"};
    color: ${(props) => props.theme.text || "#1a1d1f"};
  }

  @media (max-width: ${breakpoints.md}) {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1rem;
  color: ${(props) => props.theme.text || "#1a1d1f"};
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${(props) => props.theme.border || "#e2e8f0"};
  margin: 2rem 0;

  @media (max-width: ${breakpoints.sm}) {
    margin: 1.5rem 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: ${breakpoints.xs}) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  flex: 1;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${breakpoints.md}) {
    padding: 0.6rem 1.25rem;
    font-size: 0.875rem;
    border-radius: 8px;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${(props) => props.theme.primary || "#3b82f6"};
  color: white;
  box-shadow: 0 4px 12px ${(props) => (props.theme.primary || "#3b82f6") + "33"};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.primaryDark || "#2563eb"};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${(props) => props.theme.primary || "#3b82f6"};
  border: 1px solid ${(props) => props.theme.primary || "#3b82f6"};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.secondary || "#f1f5f9"};
  }
`;

const CreateContainer = styled(motion.div)`
  text-align: center;
  padding: 2rem 1rem;

  @media (max-width: ${breakpoints.sm}) {
    padding: 1rem 0;
  }
`;

const CreateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.25rem;
  }
`;

const CreateDescription = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.textSecondary || "#64748b"};
  margin-bottom: 1.5rem;

  @media (max-width: ${breakpoints.sm}) {
    font-size: 0.875rem;
  }
`;

const WarningNote = styled.div`
  background-color: ${(props) => props.theme.warningBg || "#fff3cd"};
  color: ${(props) => props.theme.warningText || "#856404"};
  border: 1px solid ${(props) => props.theme.warningBorder || "#ffeeba"};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: ${breakpoints.md}) {
    padding: 0.6rem 0.75rem;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
`;

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
};

const cardVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { delay: 0.1, duration: 0.5, ease: "easeOut" },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Department data
const departmentData = [
  { code: "AI", name: "Artificial Intelligence", sections: ["A", "B"] },
  { code: "BT", name: "Biotechnology", sections: [] },
  { code: "CS", name: "Computer Science", sections: ["A", "B", "C", "D", "E"] },
  { code: "CD", name: "Data Science", sections: [] },
  { code: "CY", name: "Cyber Security", sections: [] },
  { code: "IS", name: "Information Science", sections: ["A", "B"] },
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
];

// Icon components
const ImportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CreateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const SchoolIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Main Component
const ImportTimeTable = ({
  onCreateClick,
  setActiveComponent,
  setHasTimeTable,
}) => {
  const [activeTab, setActiveTab] = useState("import");
  const [dept, setDept] = useState("");
  const [sect, setSect] = useState("");
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedDept, setSelectedDept] = useState(null);

  // Validate form
  useEffect(() => {
    if (activeTab === "import") {
      // If the selected department has sections, require a section selection
      const deptInfo = departmentData.find((d) => d.code === dept);
      if (deptInfo) {
        if (deptInfo.sections.length > 0) {
          setIsValid(dept !== "" && sect !== "");
        } else {
          setIsValid(dept !== "");
        }
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(true);
    }
  }, [dept, sect, activeTab]);

  // Handle department change
  const handleDeptChange = (e) => {
    const selectedCode = e.target.value;
    setDept(selectedCode);
    setSect(""); // Reset section when department changes

    // Find selected department info
    const deptInfo = departmentData.find((d) => d.code === selectedCode);
    setSelectedDept(deptInfo || null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      if (!isLoading && isAuthenticated) {
        setIsSubmitting(true);
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/attendance/initialize`,
          {
            user: {
              fullName: user.name,
              email: user.email,
              imageUrl: user.picture,
              branch: dept,
              section: sect,
              courseStart: new Date("2025-03-17"),
              courseEnd: new Date("2025-07-12"),
              minAttendance: attendancePercent,
            },
          }
        );
        if (res.data.success) {
          setActiveComponent("main");
          setHasTimeTable(true);
          toast.success("Timetable imported successfully!");
        } else {
          toast.error("Failed to import timetable. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to import timetable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer initial="initial" animate="animate" variants={pageVariants}>
      <ContentCard variants={cardVariants}>
        <CardHeader>
          <CardTitle>Class Schedule Manager</CardTitle>
          <SchoolIcon />
        </CardHeader>

        <CardContent>
          {/* Tab Selection */}
          <TabContainer>
            <TabOption
              active={activeTab === "import"}
              onClick={() => setActiveTab("import")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TabIcon>
                <ImportIcon />
              </TabIcon>
              <TabTitle>Import Timetable</TabTitle>
            </TabOption>
            <TabOption
              active={activeTab === "create"}
              onClick={() => setActiveTab("create")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TabIcon>
                <CreateIcon />
              </TabIcon>
              <TabTitle>Create New</TabTitle>
            </TabOption>
          </TabContainer>

          <AnimatePresence mode="wait">
            {activeTab === "import" ? (
              <motion.div
                key="import"
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -10 }}
                variants={sectionVariants}
              >
                <FormSection>
                  <WarningNote>
                    <WarningIcon />
                    <span>
                      Note: Import attendance feature is only available for 2nd
                      semester students.
                    </span>
                  </WarningNote>
                  <SectionTitle>Select Department & Section</SectionTitle>

                  <SelectContainer>
                    <SelectWrapper>
                      <StyledSelect
                        value={dept}
                        onChange={handleDeptChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentData.map((department) => (
                          <option key={department.code} value={department.code}>
                            {department.code} - {department.name}
                          </option>
                        ))}
                      </StyledSelect>
                      <SelectArrow>▼</SelectArrow>
                    </SelectWrapper>

                    {selectedDept && selectedDept.sections.length > 0 && (
                      <SelectWrapper>
                        <StyledSelect
                          value={sect}
                          onChange={(e) => setSect(e.target.value)}
                          required
                        >
                          <option value="">Select Section</option>
                          {selectedDept.sections.map((section) => (
                            <option key={section} value={section}>
                              Section {section}
                            </option>
                          ))}
                        </StyledSelect>
                        <SelectArrow>▼</SelectArrow>
                      </SelectWrapper>
                    )}
                  </SelectContainer>
                </FormSection>
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -10 }}
                variants={sectionVariants}
              >
                <CreateContainer>
                  <CreateTitle>Create a New Timetable</CreateTitle>
                  <CreateDescription>
                    Build a custom timetable from scratch by adding courses,
                    setting schedules, and configuring attendance policies.
                  </CreateDescription>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PrimaryButton
                      onClick={() => {
                        onCreateClick(true);
                      }}
                    >
                      Start Creating
                    </PrimaryButton>
                  </motion.div>
                </CreateContainer>
              </motion.div>
            )}
          </AnimatePresence>

          <Divider />

          {activeTab === "import" && (
            <ActionButtons>
              <SecondaryButton
                onClick={() => {
                  setDept("");
                  setSect("");
                  setAttendancePercent(85);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset
              </SecondaryButton>
              <PrimaryButton
                disabled={!isValid || isSubmitting}
                onClick={handleSubmit}
                whileHover={{ scale: isValid && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: isValid && !isSubmitting ? 0.98 : 1 }}
              >
                {isSubmitting ? "Processing..." : "Import Timetable"}
              </PrimaryButton>
            </ActionButtons>
          )}
        </CardContent>
      </ContentCard>
    </PageContainer>
  );
};

export default ImportTimeTable;
