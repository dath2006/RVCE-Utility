import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronLeft, ChevronRight, Github, Handshake, Mail } from "lucide-react";

import WaveLoader from "../components/Loading";

const ITEMS_PER_PAGE = 10;

const majorContributors = [
  {
    name: "Adithya Bhandari",
    description:
      "Played a pivotal role in kickstarting the resource collection for first-year students and laid the foundation for the platform.",
    github: "https://github.com/aditya-bhandari-cd23",
  },
  {
    name: "Hitarth Mehra",
    description:
      "Curated and organized second-year resources, significantly improving content quality and accessibility.",
    github: "https://github.com/Hitme02",
  },
   {
    name: "Ananth M Athreya",
    description:
      "Curated and organized third-year resources, significantly improving content quality and accessibility.",
    github: "https://github.com/AnanthMAthreya",
  },
];

const fileTypeLabels = {
  Notes: "Notes",
  QP: "Question Papers",
  Lab: "Lab Work",
  Textbook: "Textbooks",
  Other: "Other",
};

const fileTypeOrder = ["Notes", "QP", "Lab", "Textbook", "Other"];

const StatTile = ({ label, value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    const duration = 1000;
    let animationFrame;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <div>
      <p className="s-figure">{displayValue.toLocaleString()}</p>
      <p className="s-label">{label}</p>
    </div>
  );
};

const Contributors = ({
  setShowAuthCard,
  showAuthCard,
  setDisableWorkSpace,
}) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated, isLoading, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    setDisableWorkSpace(false);
  }, [setDisableWorkSpace]);

  useEffect(() => {
    const getContributors = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/contribute/fetch`,
        );

        if (!res.data?.success) {
          toast.error("Error fetching contributors");
          return;
        }

        const fetchedContributors = res.data.contributors || [];
        setContributors(fetchedContributors);

        if (isAuthenticated && user?.email) {
          const sorted = [...fetchedContributors].sort(
            (a, b) => b.resources.length - a.resources.length,
          );
          const index = sorted.findIndex((c) => c.email === user.email);
          setUserRank(index !== -1 ? index + 1 : null);
        }
      } catch (error) {
        toast.error("Error fetching contributors");
      } finally {
        setLoading(false);
      }
    };

    getContributors();
  }, [isAuthenticated, user]);

  const regularContributors = useMemo(() => {
    return [...contributors]
      .filter((contributor) => {
        return !majorContributors.some((mc) => mc.name === contributor.name);
      })
      .sort((a, b) => b.resources.length - a.resources.length);
  }, [contributors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [regularContributors.length]);

  const totalResources = useMemo(() => {
    return contributors.reduce((sum, c) => sum + c.resources.length, 0);
  }, [contributors]);

  const totalPages = Math.max(
    1,
    Math.ceil(regularContributors.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentContributors = regularContributors.slice(startIndex, endIndex);

  const getFileTypeCounts = (resources = []) => {
    const counts = { Notes: 0, QP: 0, Lab: 0, Textbook: 0, Other: 0 };
    resources.forEach((resource) => {
      if (counts[resource.fileType] !== undefined) {
        counts[resource.fileType] += 1;
      }
    });
    return counts;
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) buttons.push(i);
      return buttons;
    }

    buttons.push(1);
    if (currentPage > 3) buttons.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i += 1) {
      if (i !== 1 && i !== totalPages) buttons.push(i);
    }

    if (currentPage < totalPages - 2) buttons.push("...");
    buttons.push(totalPages);

    return buttons;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    const contributorsSection = document.getElementById("contributors-list");
    if (contributorsSection) {
      const top =
        contributorsSection.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <WaveLoader
          size="7em"
          primaryColor="hsl(var(--primary))"
          secondaryColor="hsl(var(--sage))"
        />
      </div>
    );
  }

  return (
    <main
      className="s-wrap"
      style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 2rem)" }}
    >
      <header className="s-stack">
        <h1 className="s-display">Community contributions</h1>
        <p className="s-lead">
          Top contributors, resource counts, and the contribution workflow.
        </p>
        <div className="s-actions">
          <button
            type="button"
            className="s-btn"
            onClick={() => {
              if (!isAuthenticated && !isLoading) {
                setShowAuthCard(!showAuthCard);
              } else {
                navigate("/contribute", { state: { userRank } });
              }
            }}
          >
            <Handshake className="h-4 w-4" />
            Start contributing
          </button>
          {userRank && <p className="s-label">Your rank: #{userRank}</p>}
        </div>
      </header>

      <section className="s-figures">
        <StatTile label="Total contributors" value={contributors.length} />
        <StatTile label="Resources shared" value={totalResources} />
        <StatTile label="Major contributors" value={majorContributors.length} />
      </section>

      <section className="s-section">
        <div className="s-section-head">
          <h2 className="s-h2">Major contributors</h2>
        </div>
        <ul className="s-rows s-panel s-panel--sand s-panel--flush grain">
          {majorContributors.map((contributor) => (
            <li key={contributor.name} className="s-row s-row--top">
              <span />
              <span>
                <span className="s-title block">{contributor.name}</span>
                <span className="s-body block" style={{ marginTop: "0.25rem" }}>
                  {contributor.description}
                </span>
              </span>
              {contributor.github ? (
                <button
                  type="button"
                  className="s-btn s-btn--sm s-btn--quiet"
                  onClick={() =>
                    window.open(
                      contributor.github,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <Github className="h-4 w-4" />
                  View GitHub
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="contributors-list" className="s-section">
        <div className="s-section-head">
          <h2 className="s-h2">All contributors</h2>
          {regularContributors.length > 0 && (
            <p className="s-label">
              Showing {startIndex + 1}-
              {Math.min(endIndex, regularContributors.length)} of{" "}
              {regularContributors.length}
            </p>
          )}
        </div>

        {regularContributors.length === 0 ? (
          <div className="s-panel grain">
            <p className="s-title">No contributors yet</p>
            <p className="s-body">
              Be the first to contribute resources to the community.
            </p>
          </div>
        ) : (
          <>
            <ol className="s-rows s-panel s-panel--flush grain">
              {currentContributors.map((contributor, index) => {
                const globalRank = startIndex + index + 1;
                const counts = getFileTypeCounts(contributor.resources || []);
                const breakdown = fileTypeOrder
                  .filter((fileType) => counts[fileType])
                  .map(
                    (fileType) =>
                      `${fileTypeLabels[fileType]} ${counts[fileType]}`,
                  )
                  .join(", ");

                return (
                  <li
                    key={`${contributor.name}-${globalRank}`}
                    className="s-row s-row--ranked"
                  >
                    <span className="s-step-num">{globalRank}</span>
                    <span className="min-w-0">
                      <span className="s-title block">{contributor.name}</span>
                      {breakdown && (
                        <span
                          className="s-body block"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {breakdown}
                        </span>
                      )}
                    </span>
                    <span className="s-tail">
                      <span className="s-total">
                        <span className="s-total-n">
                          {contributor.resources.length}
                        </span>
                        <span className="s-label">Total resources</span>
                      </span>
                      {contributor.github && (
                        <button
                          type="button"
                          className="s-btn s-btn--sm s-btn--quiet"
                          onClick={() =>
                            window.open(
                              contributor.github,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          aria-label={`View ${contributor.name} GitHub`}
                        >
                          <Github className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>

            {totalPages > 1 && (
              <div className="s-pager">
                <button
                  type="button"
                  className="s-btn s-btn--sm s-btn--quiet"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPaginationButtons().map((item, index) => (
                  <button
                    type="button"
                    key={`${item}-${index}`}
                    className={`s-btn s-btn--sm ${item === currentPage ? "" : "s-btn--quiet"}`}
                    onClick={() =>
                      typeof item === "number" && handlePageChange(item)
                    }
                    disabled={item === "..."}
                  >
                    {item}
                  </button>
                ))}

                <button
                  type="button"
                  className="s-btn s-btn--sm s-btn--quiet"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="s-foot">
        <div>
          <p className="s-title">Want to get in touch?</p>
          <p className="s-body">
            Reach out for feedback, collaboration, or contribution-related
            support.
          </p>
        </div>
        <button
          type="button"
          className="s-btn"
          onClick={() => {
            window.location.href = "mailto:rvceutility@gmail.com";
          }}
        >
          <Mail className="h-4 w-4" />
          Contact us
        </button>
      </footer>
    </main>
  );
};

export default Contributors;
