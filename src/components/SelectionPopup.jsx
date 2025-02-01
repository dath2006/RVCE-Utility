import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import jsonData from "../data/folderHierarchy.json";
import { TbHelpSquareRoundedFilled } from "react-icons/tb";
import Help from "./Help";
import searchFiles from "../hooks/searchFiles";
import { Close } from "@mui/icons-material";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.secondary}66;
    border-radius: 3px;
  }
`;

const PopupCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 2rem;
  border-radius: 15px;
  width: 95%;
  max-width: 600px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  max-height: 95vh;

  h2 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    margin: 1.5rem 0 1rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 100%;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const Card = styled(motion.div)`
  padding: 1.5rem;
  background: ${(props) =>
    props.disabled ? props.theme.secondary : props.theme.gradient};
  color: ${(props) => (props.disabled ? props.theme.text : "white")};
  border-radius: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  text-align: center;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 500;

  @media (max-width: 768px) {
    padding: 1.25rem;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ContinueButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${(props) =>
    props.disabled ? props.theme.secondary : props.theme.gradient};
  color: ${(props) => (props.disabled ? props.theme.text : "white")};
  font-size: 1rem;
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: opacity 0.2s;
`;

const StyledSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.primary}33;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  option {
    padding: 1rem;
    background: ${(props) => props.theme.surface};
    color: ${(props) => props.theme.text};
    font-weight: 500;
  }

  & option {
    padding: 16px;
    margin: 8px;
    font-size: 1rem;
    background-color: ${(props) => props.theme.surface};
    color: ${(props) => props.theme.text};
    cursor: pointer;
    border-radius: 8px;

    &:hover {
      background-color: ${(props) => props.theme.primary};
      color: white;
    }

    &:checked {
      background: ${(props) => props.theme.gradient};
      color: white;
    }
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.secondary}66;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    margin: 0.75rem 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1000;

  &:hover {
    background: ${(props) => props.theme.secondary};
  }
`;

const SelectionPopup = ({ onClose, onSubmit }) => {
  const [year, setYear] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [escCourses, setEscCourses] = useState([]);
  const [plcCourses, setPlcCourses] = useState([]);
  const [etcCourses, setEtcCourses] = useState([]);
  const [kannadaCourses, setKannadaCourses] = useState([]);
  const [selectedESC, setSelectedESC] = useState("");
  const [selectedPLC, setSelectedPLC] = useState("");
  const [selectedETC, setSelectedETC] = useState("");
  const [selectedKannada, setSelectedKannada] = useState("");
  const [showHelp, setShowHelp] = useState([false, ""]);

  useEffect(() => {
    const firstYear = jsonData.find((item) => item.name === "1 Year");
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
        setEtcCourses(etc ? etc.children.map((course) => course.name) : []);
        setKannadaCourses(
          kannada ? kannada.children.map((course) => course.name) : []
        );
      }
    }
  }, []);

  const handleSubmit = () => {
    onSubmit({
      year,
      cycle,
      selectedESC,
      selectedPLC,
      selectedETC,
      selectedKannada,
    });
    onClose();
  };

  const isComplete = () => {
    if (cycle === "C - Cycle") {
      return selectedESC && selectedPLC;
    } else if (cycle === "P - Cycle") {
      return selectedETC && selectedKannada;
    }
    return false;
  };

  const getContent = (text) => {
    const results = searchFiles(`_which ${text} to choose.txt`);
    return results.map((result, index) => result.Content);
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CloseButton
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Close />
      </CloseButton>
      <PopupCard
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h2 className="inline-block">Select Your Year</h2>

        <Grid>
          <Card
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setYear("1 Year")}
          >
            1 Year
          </Card>
          <Card className="flex-1" disabled>
            2 Year
          </Card>
          <Card disabled>3 Year</Card>
          <Card disabled>4 Year</Card>
        </Grid>

        {year === "1 Year" && (
          <>
            <h3>Select Cycle</h3>
            <Grid>
              <Card
                onClick={() => setCycle("C - Cycle")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                C - Cycle
              </Card>
              <Card
                onClick={() => setCycle("P - Cycle")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                P - Cycle
              </Card>
            </Grid>
          </>
        )}

        {cycle === "C - Cycle" && (
          <>
            <h3>Select Courses</h3>
            <div className="flex items-center">
              <StyledSelect
                value={selectedESC}
                onChange={(e) => setSelectedESC(e.target.value)}
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
              <span
                className="ml-2 text-gray-500 cursor-pointer text-2xl"
                onClick={() => {
                  setShowHelp([true, getContent("esc")]);
                }}
              >
                <TbHelpSquareRoundedFilled />
              </span>
            </div>
            {showHelp[0] && (
              <Help
                text={showHelp[1]}
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
              />
            )}

            <div className="flex items-center">
              <StyledSelect
                value={selectedPLC}
                onChange={(e) => setSelectedPLC(e.target.value)}
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
              <span
                className="ml-2 text-gray-500 cursor-pointer text-2xl"
                onClick={() => {
                  setShowHelp([true, getContent("plc")]);
                }}
              >
                <TbHelpSquareRoundedFilled />
              </span>
            </div>
          </>
        )}

        {cycle === "P - Cycle" && (
          <>
            <h3>Select Courses</h3>
            <div className="flex items-center">
              <StyledSelect
                value={selectedETC}
                onChange={(e) => setSelectedETC(e.target.value)}
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
              <span
                className="ml-2 text-gray-500 cursor-pointer text-2xl"
                onClick={() => {
                  setShowHelp([true, getContent("etc")]);
                }}
              >
                <TbHelpSquareRoundedFilled />
              </span>
            </div>

            <div className="flex items-center">
              <StyledSelect
                value={selectedKannada}
                onChange={(e) => setSelectedKannada(e.target.value)}
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
              <span
                className="ml-2 text-gray-500 cursor-pointer text-2xl"
                onClick={() => {
                  setShowHelp([true, "You Know Na Dude! 😁"]);
                }}
              >
                <TbHelpSquareRoundedFilled />
              </span>
            </div>
            {showHelp[0] && (
              <Help
                text={showHelp[1]}
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
              />
            )}
          </>
        )}
        <ContinueButton
          disabled={!isComplete()}
          whileHover={!isComplete() ? {} : { scale: 1.02 }}
          whileTap={!isComplete() ? {} : { scale: 0.98 }}
          onClick={handleSubmit}
        >
          Continue
        </ContinueButton>
      </PopupCard>
    </Overlay>
  );
};

export default SelectionPopup;
