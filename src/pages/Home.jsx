import React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SelectionPopup from "../components/SelectionPopup";
import AfterVisit from "../components/AfterVisit";
import UserManual from "../components/UserManual";
import FeaturesSection from "../components/FeaturesSection";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.theme.gradient};
  padding: 2rem;
  margin-top: 4rem;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  color: white;
  margin-bottom: 2rem;
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin-bottom: 3rem;
`;

const GetStartedButton = styled(motion.button)`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 50px;
  background: white;
  color: ${(props) => props.theme.primary};
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const Home = () => {
  const navigate = useNavigate();
  const [firstVisit, setFirstVisit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showFeatures, setshowFeatures] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem("filters");
    if (isFirstVisit) {
      setFirstVisit(true);
    }
  }, []);

  const handleGetStarted = () => {
    setshowFeatures(true);
  };

  const handleFeaturesComplete = () => {
    setshowFeatures(false);
    setShowPopup(true);
  };

  return firstVisit ? (
    <Container>
      <Title
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to RVCE Resource Portal
      </Title>
      <Description
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Access all your college resources in one place. Browse through study
        materials, notes, and more with our easy-to-use interface.
      </Description>
      <GetStartedButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onClick={handleGetStarted}
      >
        Get Started
      </GetStartedButton>
      <AnimatePresence>
        {showFeatures && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FeaturesSection />
            </motion.div>
            <GetStartedButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={handleFeaturesComplete}
              className="mb-64 mt-10"
            >
              Continue
            </GetStartedButton>
          </>
        )}

        {showPopup && (
          <SelectionPopup
            onClose={() => setShowPopup(false)}
            onSubmit={(selectedFilters) => {
              setFilters(selectedFilters);
              localStorage.setItem("filters", JSON.stringify(selectedFilters));
              navigate("/resources");
            }}
          />
        )}
      </AnimatePresence>
    </Container>
  ) : (
    <>
      <AfterVisit />
      <footer className="bg-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} ಆರ್.ವಿ Utility. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
