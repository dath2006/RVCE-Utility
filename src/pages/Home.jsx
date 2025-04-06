import React from "react";
import { useState, useEffect } from "react";
import AfterVisit from "../components/AfterVisit";
import FirstVisit from "../components/FirstVisit";

const Home = ({ showAuthCard, setShowAuthCard, setDisableWorkSpace }) => {
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(false);
    };
    setShow();
  }, []);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem("filters");
    if (isFirstVisit) {
      setFirstVisit(true);
    }
  }, []);

  return firstVisit ? (
    <FirstVisit />
  ) : (
    <>
      <AfterVisit
        setShowAuthCard={setShowAuthCard}
        showAuthCard={showAuthCard}
      />
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
