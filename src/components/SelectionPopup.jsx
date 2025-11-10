import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
// import jsonData from "../data/folderHierarchy.json";
import { TbHelpSquareRoundedFilled } from "react-icons/tb";
import Help from "./Help";
import searchFiles from "../hooks/searchFiles";
import { Close, ArrowForward, ArrowBack } from "@mui/icons-material";
import axios from "axios";
import WaveLoader from "./Loading";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
`;

const PopupCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 16px;
  width: 95%;
  max-width: 500px;
  position: relative;
  margin: 1rem auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid ${(props) => props.theme.border || "rgba(255,255,255,0.1)"};
  overflow: visible;
`;

const StepContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
  min-height: 250px;
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 600;
    color: ${(props) => props.theme.text};
    margin-bottom: 0.25rem;
  }

  p {
    color: ${(props) => props.theme.text + "80"};
    font-size: 0.95rem;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
`;

const StepDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.text + "40"};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const StepContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled(motion.div)`
  padding: 1rem;
  background: ${(props) =>
    props.selected
      ? props.theme.gradient
      : props.disabled
      ? props.theme.secondary + "20"
      : props.theme.surface};
  color: ${(props) =>
    props.selected
      ? "white"
      : props.disabled
      ? props.theme.text + "80"
      : props.theme.text};
  border-radius: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid
    ${(props) =>
      props.selected
        ? props.theme.primary
        : props.theme.border || "rgba(255,255,255,0.1)"};
  transition: all 0.3s ease;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled ? "none" : `0 4px 12px ${props.theme.primary}30`};
  }
`;

const StyledSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: 0.875rem;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border || "rgba(255,255,255,0.1)"};
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.875em;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 2px ${(props) => props.theme.primary}33;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  option {
    padding: 0.75rem;
    background: ${(props) => props.theme.surface};
    color: ${(props) => props.theme.text};
    font-weight: 500;
    font-size: 0.95rem;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .help-icon {
    color: ${(props) => props.theme.primary};
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.25rem;

    &:hover {
      transform: scale(1.1);
      color: ${(props) => props.theme.secondary};
    }
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 0.75rem;
`;

const NavButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  background: ${(props) =>
    props.disabled ? props.theme.secondary + "20" : props.theme.gradient};
  color: ${(props) => (props.disabled ? props.theme.text + "80" : "white")};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.3s ease;
  border: 1px solid ${(props) => props.theme.border || "rgba(255,255,255,0.1)"};

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled ? "none" : `0 4px 12px ${props.theme.primary}30`};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border || "rgba(255,255,255,0.1)"};
  color: ${(props) => props.theme.text};
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1000;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.primary};
    color: white;
    transform: rotate(90deg);
  }
`;

const LoadingSpinner = styled(motion.div)`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  z-index: 99;
`;

const SelectionPopup = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState({
    year: "",
    cycle: "",
    selectedESC: "",
    selectedPLC: "",
    selectedETC: "",
    selectedKannada: "",
    selectedSem3: "",
  });

  const [escCourses, setEscCourses] = useState([]);
  const [plcCourses, setPlcCourses] = useState([]);
  const [etcCourses, setEtcCourses] = useState([]);
  const [kannadaCourses, setKannadaCourses] = useState([]);
  const [sem3Courses, setSem3Courses] = useState([]);
  const [showHelp, setShowHelp] = useState([false, "hi"]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFiles();
    // handleSelect();
  }, []);

  const handleSelect = (data) => {
    if (!data || data.length === 0) {
      console.info("No folder data available");
      return;
    }
    const firstYear = data.find((item) => item.name === "1 Year");
    const secondYear = data.find((item) => item.name === "2 Year");

    if (secondYear) {
      const sem3 = secondYear.children.find(
        (item) => item.name === "3-Sem-CSE" || item.name === "3-Sem-ECE"
      );
      if (sem3) {
        const basket = sem3.children.find(
          (item) => item.name === "Basket course"
        );
        setSem3Courses(
          basket ? basket.children.map((course) => course.name) : []
        );
      }
    }

    if (firstYear) {
      const cCycle = firstYear.children.find(
        (item) => item.name === "C - Cycle"
      );
      const pCycle = firstYear.children.find(
        (item) => item.name === "P - Cycle"
      );

      if (cCycle) {
        const esc = cCycle.children.find((item) => item.name === "ESC");
        const plc = cCycle.children.find(
          (item) => item.name === "PLC (22PL15X)"
        );
        setEscCourses(esc ? esc.children.map((course) => course.name) : []);
        setPlcCourses(plc ? plc.children.map((course) => course.name) : []);
      }

      if (pCycle) {
        const etc = pCycle.children.find(
          (item) => item.name === "ETC (22EM2XX)"
        );
        const kannada = pCycle.children.find(
          (item) => item.name === "Kannada (22HSXK17)"
        );
        const esc = cCycle.children.find((item) => item.name === "ESC");
        setEscCourses(esc ? esc.children.map((course) => course.name) : []);
        setEtcCourses(etc ? etc.children.map((course) => course.name) : []);
        setKannadaCourses(
          kannada ? kannada.children.map((course) => course.name) : []
        );
      }
    }
  };

  async function getFiles() {
    setLoading(true);
    try {
      const res = await axios.get(import.meta.env.VITE_FILES_URL);
      const data = res.data;
      handleSelect(data);
      setJsonData(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }

  const getContent = (text) => {
    const results = searchFiles(`_which ${text} to choose.txt`, jsonData);
    console.log(results);

    return results ? results[0].Content : "No help content available.";
  };

  const steps = [
    {
      title: "Select Your Year",
      description: "Choose your current year of study",
      content: (
        <StepContent>
          <Card
            selected={selection.year === "1 Year"}
            onClick={() =>
              setSelection((prev) => {
                return { ...prev, year: "1 Year" };
              })
            }
            whilehover={{ scale: 1.02 }}
            whiletap={{ scale: 0.98 }}
          >
            1 Year
          </Card>
          <Card
            selected={selection.year === "2 Year"}
            onClick={() =>
              setSelection((prev) => {
                return { ...prev, year: "2 Year" };
              })
            }
            whilehover={{ scale: 1.02 }}
            whiletap={{ scale: 0.98 }}
          >
            2 Year
          </Card>
          <Card disabled>3 Year</Card>
          <Card disabled>4 Year</Card>
        </StepContent>
      ),
    },
    {
      title: "Choose Your Sem",
      description: "Select your academic semester/cycle",
      content: (
        <StepContent>
          {selection.year === "1 Year" && (
            <>
              <Card
                selected={selection.cycle === "C - Cycle"}
                onClick={() =>
                  setSelection((prev) => {
                    return { ...prev, cycle: "C - Cycle" };
                  })
                }
                whilehover={{ scale: 1.02 }}
                whiletap={{ scale: 0.98 }}
              >
                C - Cycle
              </Card>
              <Card
                selected={selection.cycle === "P - Cycle"}
                onClick={() =>
                  setSelection((prev) => {
                    return { ...prev, cycle: "P - Cycle" };
                  })
                }
                whilehover={{ scale: 1.02 }}
                whiletap={{ scale: 0.98 }}
              >
                P - Cycle
              </Card>
            </>
          )}
          {selection.year === "2 Year" && (
            <>
              <Card
                selected={selection.cycle === "3-Sem-CSE"}
                onClick={() =>
                  setSelection((prev) => {
                    return { ...prev, cycle: "3-Sem-CSE" };
                  })
                }
                whilehover={{ scale: 1.02 }}
                whiletap={{ scale: 0.98 }}
              >
                3rd - Sem (CSE)
              </Card>
              <Card
                selected={selection.cycle === "3-Sem-ECE"}
                onClick={() =>
                  setSelection((prev) => {
                    return { ...prev, cycle: "3-Sem-ECE" };
                  })
                }
                whilehover={{ scale: 1.02 }}
                whiletap={{ scale: 0.98 }}
              >
                3rd - Sem (ECE)
              </Card>
            </>
          )}
        </StepContent>
      ),
    },
    {
      title: "Select Your Courses",
      description: "Choose your courses based on your semester/cycle",
      content: (
        <StepContent>
          {selection.cycle === "C - Cycle" ? (
            <>
              <SelectContainer>
                <StyledSelect
                  value={selection.selectedESC}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedESC: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select ESC Course --</option>
                  {escCourses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, getContent("esc")]);
                  }}
                />
              </SelectContainer>

              <SelectContainer>
                <StyledSelect
                  value={selection.selectedPLC}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedPLC: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select PLC Course --</option>
                  {plcCourses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, getContent("plc")]);
                  }}
                />
              </SelectContainer>
            </>
          ) : selection.cycle === "P - Cycle" ? (
            <>
              <SelectContainer>
                <StyledSelect
                  value={selection.selectedETC}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedETC: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select ETC Course --</option>
                  {etcCourses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, getContent("etc")]);
                  }}
                />
              </SelectContainer>

              <SelectContainer>
                <StyledSelect
                  value={selection.selectedESC}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedESC: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select ESC Course --</option>
                  {escCourses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, getContent("esc")]);
                  }}
                />
              </SelectContainer>

              <SelectContainer>
                <StyledSelect
                  value={selection.selectedKannada}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedKannada: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select Kannada Course --</option>
                  {kannadaCourses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, "You Know Na Dude! 😁"]);
                  }}
                />
              </SelectContainer>
            </>
          ) : selection.cycle === "3-Sem-CSE" ? (
            <>
              <SelectContainer>
                <StyledSelect
                  value={selection.selectedSem3}
                  onChange={(e) =>
                    setSelection((prev) => {
                      return { ...prev, selectedSem3: e.target.value };
                    })
                  }
                >
                  <option value="">-- Select Basket Course --</option>
                  {sem3Courses.map(
                    (course, index) =>
                      !course.includes(".txt") && (
                        <option key={index} value={course}>
                          {course}
                        </option>
                      )
                  )}
                </StyledSelect>
                <TbHelpSquareRoundedFilled
                  className="help-icon"
                  onClick={() => {
                    setShowHelp([true, getContent("basket")]);
                  }}
                />
              </SelectContainer>
            </>
          ) : selection.cycle === "3-Sem-ECE" ? (
            <>
              {selection.selectedSem3 !== "N/A" &&
                setSelection((prev) => ({ ...prev, selectedSem3: "N/A" }))}
              <p>
                No course selection needed for 3rd Sem ECE. Click "Finish" to
                proceed.
              </p>
            </>
          ) : null}
        </StepContent>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(selection);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return selection.year !== "";
      case 1:
        return selection.cycle !== "";
      case 2:
        if (selection.cycle === "C - Cycle") {
          return selection.selectedESC && selection.selectedPLC;
        } else if (selection.cycle === "P - Cycle") {
          return (
            selection.selectedETC &&
            selection.selectedKannada &&
            selection.selectedESC
          );
        } else if (selection.cycle === "3-Sem-CSE") {
          return selection.selectedSem3;
        } else if (selection.cycle === "3-Sem-ECE") {
          return true;
        }
      default:
        return false;
    }
  };

  return loading ? (
    <LoadingSpinner>
      <WaveLoader
        size="7em"
        primaryColor="hsl(220,90%,50%)"
        secondaryColor="hsl(300,90%,50%)"
      />
    </LoadingSpinner>
  ) : (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CloseButton onClick={onClose}>
        <Close />
      </CloseButton>
      <PopupCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <StepHeader>
          <h2>{steps[currentStep].title}</h2>
          <p>{steps[currentStep].description}</p>
        </StepHeader>

        <StepIndicator>
          {steps.map((_, index) => (
            <StepDot
              key={index}
              active={index === currentStep}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </StepIndicator>

        <AnimatePresence mode="wait">
          <StepContainer
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].content}
          </StepContainer>
        </AnimatePresence>

        <NavigationButtons>
          <NavButton
            onClick={handleBack}
            disabled={currentStep === 0}
            whilehover={currentStep === 0 ? {} : { scale: 1.02 }}
            whiletap={currentStep === 0 ? {} : { scale: 0.98 }}
          >
            <ArrowBack /> Back
          </NavButton>
          <NavButton
            onClick={handleNext}
            disabled={!isStepComplete()}
            whilehover={!isStepComplete() ? {} : { scale: 1.02 }}
            whiletap={!isStepComplete() ? {} : { scale: 0.98 }}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
            <ArrowForward />
          </NavButton>
        </NavigationButtons>
      </PopupCard>
      {showHelp[0] && (
        <Help
          text={showHelp[1]}
          isOpen={showHelp[0]}
          onClose={() => setShowHelp([false, ""])}
        />
      )}
    </Overlay>
  );
};

export default SelectionPopup;
