import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ChevronLeft,
  ChevronRight,
  Github,
  Handshake,
  Mail,
  Medal,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import WaveLoader from "../components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
];

const fileTypeLabels = {
  Notes: "Notes",
  QP: "Question Papers",
  Lab: "Lab Work",
  Textbook: "Textbooks",
  Other: "Other",
};

const fileTypeOrder = ["Notes", "QP", "Lab", "Textbook", "Other"];

const ContributorRankIcon = ({ rank }) => {
  if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" />;
  if (rank === 2 || rank === 3)
    return <Medal className="h-4 w-4 text-slate-400" />;
  return <Star className="h-4 w-4 text-primary" />;
};

const StatTile = ({ label, value, delay = 0 }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
    >
      <Card className="rounded-2xl border-border/70 bg-card/85">
        <CardContent className="p-4 text-center sm:p-5">
          <p className="text-2xl font-bold text-primary sm:text-3xl">
            {displayValue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
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
          primaryColor="hsl(220,90%,50%)"
          secondaryColor="hsl(300,90%,50%)"
        />
      </div>
    );
  }

  return (
    <main
      className="mx-auto w-full max-w-7xl px-3 pb-24 sm:px-6 lg:px-8"
      style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 0.7rem)" }}
    >
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-56 w-56 rounded-full bg-foreground/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs tracking-[0.2em]"
          >
            CONTRIBUTORS
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Community Contributions
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Explore top contributors, see resource distribution, and join the
            contribution workflow. This page shows clear ranking, category
            counts, and total activity.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              className="rounded-full px-6"
              onClick={() => {
                if (!isAuthenticated && !isLoading) {
                  setShowAuthCard(!showAuthCard);
                } else {
                  navigate("/contribute", { state: { userRank } });
                }
              }}
            >
              <Handshake className="h-4 w-4" />
              Start Contributing
            </Button>
            {userRank && (
              <Badge variant="outline" className="rounded-full px-4 py-1.5">
                Your Rank: #{userRank}
              </Badge>
            )}
          </div>
        </motion.div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
        <StatTile
          label="Total Contributors"
          value={contributors.length}
          delay={0.03}
        />
        <StatTile
          label="Resources Shared"
          value={totalResources}
          delay={0.08}
        />
        <StatTile
          label="Major Contributors"
          value={majorContributors.length}
          delay={0.13}
        />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2 sm:mb-5">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-semibold sm:text-2xl">
            Major Contributors
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {majorContributors.map((contributor) => (
            <Card
              key={contributor.name}
              className="rounded-2xl border-border/70 bg-card/90"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{contributor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {contributor.description}
                </p>
                {contributor.github && (
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full"
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
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="contributors-list" className="mt-8">
        <div className="mb-4 flex items-center gap-2 sm:mb-5">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold sm:text-2xl">
            All Contributors
          </h2>
        </div>

        {regularContributors.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/80 bg-card/70">
            <CardContent className="py-10 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-lg font-medium">No contributors yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to contribute resources to the community.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentContributors.map((contributor, index) => {
                const globalRank = startIndex + index + 1;
                const counts = getFileTypeCounts(contributor.resources || []);

                return (
                  <motion.div
                    key={`${contributor.name}-${globalRank}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <Card className="h-full rounded-2xl border-border/70 bg-card/90">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="line-clamp-2 text-base sm:text-lg">
                            {contributor.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2.5 py-1 text-xs"
                          >
                            <ContributorRankIcon rank={globalRank} /> #
                            {globalRank}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {fileTypeOrder.map((fileType) => {
                            if (!counts[fileType]) return null;
                            return (
                              <Badge
                                key={fileType}
                                variant="outline"
                                className="rounded-full text-[11px]"
                              >
                                {fileTypeLabels[fileType]}: {counts[fileType]}
                              </Badge>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                          <div>
                            <p className="text-xl font-bold text-primary">
                              {contributor.resources.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total resources
                            </p>
                          </div>

                          {contributor.github && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 rounded-full"
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
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPaginationButtons().map((item, index) => (
                  <Button
                    key={`${item}-${index}`}
                    variant={item === currentPage ? "default" : "outline"}
                    className="h-9 min-w-9 rounded-full px-3"
                    onClick={() =>
                      typeof item === "number" && handlePageChange(item)
                    }
                    disabled={item === "..."}
                  >
                    {item}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <p className="w-full text-center text-xs text-muted-foreground sm:w-auto sm:text-sm">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, regularContributors.length)} of{" "}
                  {regularContributors.length}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-card/85 p-5 text-center shadow-sm backdrop-blur sm:p-7">
        <h3 className="text-xl font-semibold sm:text-2xl">
          Want to get in touch?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Reach out for feedback, collaboration, or contribution-related
          support.
        </p>
        <Button
          className="mt-4 rounded-full px-6"
          onClick={() => {
            window.location.href = "mailto:rvceutility@gmail.com";
          }}
        >
          <Mail className="h-4 w-4" />
          Contact Us
        </Button>
      </section>
    </main>
  );
};

export default Contributors;
