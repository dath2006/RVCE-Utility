import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SelectionPopup from "./SelectionPopup";
import { useOverlay } from "../contexts/NavigationContext";

const steps = [
  {
    title: "Pick your branch",
    description: "Year, cycle, and course filters",
  },
  {
    title: "Save your preferences",
    description: "Stored locally for future visits",
  },
  {
    title: "Enter the resources view",
    description: "Straight into the materials that match you",
  },
];

function FirstVisit() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useOverlay("firstVisit", true);

  return (
    <section className="s-wrap">
      <div className="s-hero" style={{ minHeight: "calc(100dvh - 11rem)" }}>
        <div className="s-stack">
          <h1 className="s-display">Set up your RVCE resources once.</h1>
          <p className="s-lead">
            Pick your year, cycle, and courses; matching notes open first.
          </p>
          <div className="s-actions">
            <button
              type="button"
              className="s-btn"
              onClick={() => setShowPopup(true)}
            >
              Get started
            </button>
            <button
              type="button"
              className="s-link"
              onClick={() => navigate("/contributors")}
            >
              Explore community updates
            </button>
          </div>
        </div>

        <div className="s-panel s-panel--flush grain">
          <ol className="s-rows">
            {steps.map((step, index) => (
              <li key={step.title} className="s-row">
                <span className="s-step-num">{index + 1}</span>
                <div>
                  <h2 className="s-title">{step.title}</h2>
                  <p className="s-body">{step.description}</p>
                </div>
                <span />
              </li>
            ))}
          </ol>
          <p className="s-label" style={{ padding: "1rem 0 1.25rem" }}>
            Change these anytime by clearing and re-selecting your filters.
          </p>
        </div>
      </div>

      {showPopup && (
        <SelectionPopup
          onClose={() => setShowPopup(false)}
          onSubmit={(selectedFilters) => {
            localStorage.setItem("filters", JSON.stringify(selectedFilters));
            navigate("/resources");
          }}
        />
      )}
    </section>
  );
}

export default FirstVisit;
