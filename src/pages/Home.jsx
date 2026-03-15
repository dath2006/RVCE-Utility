/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  Github,
  HeartHandshake,
  Wrench,
} from "lucide-react";
import AfterVisit from "../components/AfterVisit";
import FirstVisit from "../components/FirstVisit";

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

  return firstVisit ? (
    <FirstVisit />
  ) : (
    <main className="relative pb-24 md:pb-10">
      <AfterVisit
        setShowAuthCard={setShowAuthCard}
        showAuthCard={showAuthCard}
      />
      <footer className="border-t border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.8rem] border border-border/70 bg-card/85 p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  Built for RVCE students
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  RV Utility
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  A focused campus utility hub for resources, attendance, and
                  student collaboration, designed to stay fast and practical.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Quick Links
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </Link>
                  <Link
                    to="/contributors"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    Contributors
                  </Link>
                  <Link
                    to="/essentials"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Wrench className="h-4 w-4" />
                    Essentials
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Open Source
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Follow development, raise issues, and contribute improvements
                  through the GitHub repository.
                </p>
                <a
                  href="https://github.com/dath2006/RVCE-Utility"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Github className="h-4 w-4" />
                  View repository
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                &copy; {new Date().getFullYear()} ಆರ್.ವಿ Utility. Crafted for
                everyday student workflows.
              </p>
              <p>Versioned updates • Community maintained • Always improving</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
