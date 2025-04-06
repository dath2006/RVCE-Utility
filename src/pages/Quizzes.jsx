import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import FileViewer from "../components/FileViewer";
import { FaGraduationCap } from "react-icons/fa";

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 8rem;
  min-height: 60vh;
  background: ${(props) => props.theme.background};
  position: relative;
  overflow: hidden;
  border-radius: 10px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(
      circle at top right,
      ${(props) => props.theme.primary}15,
      transparent 50%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    margin-top: 4rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.text};
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  svg {
    font-size: 2rem;
    color: ${(props) => props.theme.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;

    svg {
      font-size: 1.75rem;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0.25rem;
  }
`;

const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px ${(props) => props.theme.shadow}15;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: -1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  h2 {
    font-size: 1.5rem;
    color: ${(props) => props.theme.text};
    margin: 0;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .unit-number {
    font-size: 2.5rem;
    font-weight: 700;
    background: ${(props) => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.25rem;
    line-height: 1;
  }

  .unit-text {
    font-size: 1.1rem;
    opacity: 0.8;
    font-weight: 500;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px ${(props) => props.theme.shadow}25;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;

    h2 {
      font-size: 1.25rem;
    }

    .unit-number {
      font-size: 2rem;
    }

    .unit-text {
      font-size: 1rem;
    }
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.text}80;
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
`;

const quizLinks = {
  "Unit - 1": "https://cie-1.netlify.app",
  "Unit - 2": "https://joyful-gumdrop-217c25.netlify.app",
  "Unit - 3": "https://cie-3.netlify.app",
};

const Quizzes = ({ setDisableWorkSpace }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(false);
    };
    setShow();
  }, []);

  return (
    <Container>
      <Title
        as={motion.h1}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaGraduationCap />
        Constitution Quizzes
      </Title>

      <Subtitle
        as={motion.p}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Test your knowledge of the Indian Constitution with our comprehensive
        quiz series. Each unit covers specific aspects of constitutional law and
        governance.
      </Subtitle>

      <Grid>
        {Object.keys(quizLinks).map((unit, index) => (
          <Card
            key={unit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: index * 0.1,
            }}
            onClick={() => setSelectedQuiz(quizLinks[unit])}
          >
            <h2>
              <span className="unit-number">{unit.split(" - ")[1]}</span>
              <span className="unit-text">{unit}</span>
            </h2>
          </Card>
        ))}
      </Grid>

      <AnimatePresence>
        {selectedQuiz && (
          <FileViewer
            url={selectedQuiz}
            onClose={() => setSelectedQuiz(null)}
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Quizzes;
