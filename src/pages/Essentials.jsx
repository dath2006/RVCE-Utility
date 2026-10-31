import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Award,
  BookA,
  Calculator,
  Calendar,
  ExternalLink,
  Github,
  Languages,
  Mail,
  Play,
  Scale,
  Star,
} from "lucide-react";

import FileViewer from "../components/FileViewer";
import { useOverlay } from "../contexts/NavigationContext";

const BASE_URL = "https://rvceutility-quizzes.netlify.app";

const subjects = {
  "Indian Constitution": {
    slug: "indian-constitution",
    icon: Scale,
    chapters: [
      { slug: "unit1", title: "Unit - 1" },
      { slug: "unit2", title: "Unit - 2" },
      { slug: "unit3", title: "Unit - 3" },
    ],
  },
  "Balake Kannada": {
    slug: "balake-kannada",
    icon: BookA,
    chapters: [
      { slug: "module1", title: "Module - 1" },
      { slug: "module2", title: "Module - 2" },
      { slug: "module3", title: "Module - 3" },
    ],
  },
  "Samskruthika Kannada": {
    slug: "samskruthika-kannada",
    icon: Languages,
    chapters: [
      { slug: "mankutimmana-kagga", title: "ಮಂಕುತಿಮ್ಮನ ಕಗ್ಗ" },
      { slug: "vachanagalu", title: "ವಚನಗಳು" },
      { slug: "kara-kusha", title: "ಕರಕುಶ" },
      {
        slug: "karnatakada-yekikarana",
        title: "ಕರ್ನಾಟಕದ ಏಕೀಕರಣ ಒಂದು ಅಪೂರ್ವ ಚರಿತ್",
      },
      { slug: "adalitha-bhashe-kannada", title: "ಆಡಳಿತ ಭಾಷೆಯಾಗಿ ಕನ್ನಡ" },
      { slug: "keertanegalu", title: "ಕೀರ್ತನೆಗಳು" },
      {
        slug: "vishveshwarayya",
        title: "ಡಾ. ವಿಶ್ವೇಶ್ವರಯ್ಯ: ವ್ಯಕ್ತಿ ಮತ್ತು ಐತಿಹ್ಯ",
      },
      { slug: "hosa-balina-geethe", title: "ಹೊಸ ಬಾಳಿನ ಗೀತೆ" },
      { slug: "pravasa-kathana", title: "ಪ್ರವಾಸ ಕಥನ" },
      { slug: "kurudu-kanchana", title: "ಕುರುಡು ಕಾಂಚಾಣಾ" },
    ],
  },
};

function Essentials() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);

  useOverlay("essentials", !!selectedUrl);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject((prev) => (prev === subject ? "" : subject));
  };

  const handleAttempt = (subjectSlug, chapterSlug) => {
    setSelectedUrl(`${BASE_URL}/${subjectSlug}/${chapterSlug}`);
  };

  const handleGradeCalculator = () => {
    setSelectedUrl("https://rvce-grade-calculator.vercel.app");
  };

  const handleHolidayList = () => {
    setSelectedUrl(
      "https://drive.google.com/file/d/1c6h_O2zGKccDWviNap-t7_s6budIjJ_2/preview",
    );
  };

  const handleGithubStar = () => {
    window.open("https://github.com/dath2006/RVCE-Utility", "_blank");
  };

  const handleMailDeveloper = () => {
    window.open(
      "mailto:sathishdathds.cs24@rvce.edu.in?subject=Contributing to the site&body=Hi Sathish, I would like to contribute to the site...",
      "_blank",
    );
  };

  const handleContributorGithub = () => {
    window.open("https://github.com/VivaanHooda", "_blank");
  };

  const tools = [
    {
      title: "Grade calculator",
      icon: Calculator,
      caption: "Contributed by Vivaan Hooda.",
      action: "Open calculator",
      onClick: handleGradeCalculator,
    },
    {
      title: "2026 holiday list",
      icon: Calendar,
      caption: "Academic holidays and break windows.",
      action: "View holidays",
      onClick: handleHolidayList,
    },
    {
      title: "Quick tools",
      icon: Award,
      caption: "More utilities are being added.",
      action: "Explore",
      onClick: () => window.alert("More tools coming soon!"),
    },
  ];

  return (
    <div
      className="s-wrap"
      style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 2rem)" }}
    >
      <header className="s-stack" style={{ marginBottom: "3rem" }}>
        <h1 className="s-display">Essentials</h1>
        <p className="s-lead">
          Quizzes, calculators, and academic references in one place.
        </p>
      </header>

      <div className="s-cols">
        <section>
          <div className="s-section-head">
            <h2 className="s-h2">Subject quizzes</h2>
            <p className="s-label">Pick a subject, then attempt a chapter.</p>
          </div>
          <div className="s-panel s-panel--flush grain">
            <ul className="s-rows">
              {Object.entries(subjects).map(([subject, data]) => {
                const Icon = data.icon;
                const isActive = selectedSubject === subject;

                return (
                  <li key={subject}>
                    <button
                      type="button"
                      className="s-row"
                      aria-pressed={isActive}
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <Icon className="s-icon h-5 w-5" />
                      <span>
                        <span className="s-title block">{subject}</span>
                        <span className="s-body block">
                          {data.chapters.length} chapters
                        </span>
                      </span>
                      <span />
                    </button>
                  </li>
                );
              })}
            </ul>

            {selectedSubject && (
              <div key={selectedSubject} className="s-chapters">
                <h3 className="s-title">{selectedSubject} chapters</h3>
                <ul className="s-rows">
                  {subjects[selectedSubject].chapters.map((chapter, index) => (
                    <li key={chapter.slug} className="s-row">
                      <span className="s-step-num">{index + 1}</span>
                      <span
                        className="s-title"
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {chapter.title}
                      </span>
                      <button
                        type="button"
                        className="s-btn s-btn--sm"
                        onClick={() =>
                          handleAttempt(
                            subjects[selectedSubject].slug,
                            chapter.slug,
                          )
                        }
                      >
                        <Play className="h-3.5 w-3.5" />
                        Attempt
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="s-section-head">
            <h2 className="s-h2">Tools</h2>
          </div>
          <div className="s-panel s-panel--sand s-panel--flush grain">
            <ul className="s-rows">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.title} className="s-row">
                    <Icon className="s-icon h-5 w-5" />
                    <span>
                      <span className="s-title block">{tool.title}</span>
                      <span className="s-body block">{tool.caption}</span>
                      {tool.title === "Grade calculator" && (
                        <button
                          type="button"
                          onClick={handleContributorGithub}
                          className="s-link"
                          style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                        >
                          Vivaan Hooda
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      className="s-btn s-btn--sm s-btn--quiet"
                      onClick={tool.onClick}
                    >
                      {tool.action}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      <footer className="s-foot">
        <div>
          <p className="s-title">Sathish Dath</p>
          <p className="s-label">Computer Science Engineering</p>
          <p
            className="s-body"
            style={{ marginTop: "0.5rem", maxWidth: "36rem" }}
          >
            If this platform helps you, star the project and feel free to
            contribute with ideas or code.
          </p>
        </div>
        <div className="s-actions">
          <button
            type="button"
            className="s-btn s-btn--quiet"
            onClick={handleGithubStar}
          >
            <Github className="h-4 w-4" />
            <Star className="h-4 w-4" />
            Star project
          </button>
          <button type="button" className="s-btn" onClick={handleMailDeveloper}>
            <Mail className="h-4 w-4" />
            Join contributors
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {selectedUrl && (
          <FileViewer
            url={selectedUrl}
            title="Essentials"
            onClose={() => setSelectedUrl(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Essentials;
