/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AfterVisit from "../components/AfterVisit";
import FirstVisit from "../components/FirstVisit";
import "../study.css";

const Home = ({ showAuthCard, setShowAuthCard, setDisableWorkSpace }) => {
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    setDisableWorkSpace(false);
  }, [setDisableWorkSpace]);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem("filters");
    if (isFirstVisit) {
      setFirstVisit(true);
    }
  }, []);

  return (
    <div className="study study-page">
      {firstVisit ? (
        <FirstVisit />
      ) : (
        <main className="pb-24 md:pb-10">
          <AfterVisit
            setShowAuthCard={setShowAuthCard}
            showAuthCard={showAuthCard}
          />
          <footer className="s-wrap" style={{ paddingTop: 0 }}>
            <div className="s-foot" style={{ marginTop: 0 }}>
              <div>
                <p className="s-title">RV Utility</p>
                <p className="s-label">
                  &copy; {new Date().getFullYear()} ಆರ್.ವಿ Utility. Built for
                  RVCE students.
                </p>
              </div>
              <nav aria-label="Footer">
                <Link to="/resources">Resources</Link>
                <Link to="/contributors">Contributors</Link>
                <Link to="/essentials">Essentials</Link>
                <a
                  href="https://forms.gle/wXMoTKkk1Lea8cMc6"
                  target="_blank"
                  rel="noreferrer"
                >
                  Suggest an improvement
                </a>
                <a
                  href="https://github.com/dath2006/RVCE-Utility"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
};

export default Home;
