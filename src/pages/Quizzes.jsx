import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import FileViewer from "../components/FileViewer";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 10rem;

  @media (max-width: 768px) {
    margin-top: 5rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.text};
  margin-bottom: 2rem;
  text-align: center;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 2.5rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 15px ${(props) => props.theme.shadow}33;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.theme.gradient};
  }

  h2 {
    font-size: 1.75rem;
    color: ${(props) => props.theme.text};
    margin: 0;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .unit-number {
    font-size: 2.5rem;
    font-weight: 700;
    background: ${(props) => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }

  .unit-text {
    font-size: 1.25rem;
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px ${(props) => props.theme.shadow}40;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 2rem;
  }
`;
const quizLinks = {
  "Unit - 1": "https://cie-1.netlify.app",
  "Unit - 2": "https://joyful-gumdrop-217c25.netlify.app",
  "Unit - 3": "https://cie-3.netlify.app",
};

const Quizzes = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <Container>
      <Title
        as={motion.h1}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Constitution Quizzes
      </Title>

      <Grid>
        {Object.keys(quizLinks).map((unit) => (
          <Card
            key={unit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedQuiz(quizLinks[unit])}
          >
            <h2>{unit}</h2>
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
