import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  Calendar,
  Eye,
  FilePlus,
  HelpCircle,
  InfoIcon,
  LogOut,
  MessageCircleQuestionIcon,
  X,
  Youtube,
} from "lucide-react";

import WaveLoader from "../components/Loading";
import Requests from "../components/contribution/Requests";
import ViewContribution from "../components/contribution/ViewContribution";
import ViewRequests from "../components/contribution/ViewRequests";
import FileUploadSystem from "../components/fileUpload/FileUploadSystem";
import { BottomBarProvider, useBottomBar } from "../contexts/BottomBarContext";

const tabs = [
  {
    key: "contribute",
    label: "Contribute",
    shortLabel: "Contribute",
    icon: FilePlus,
    description: "Upload notes, QP, lab files and books",
  },
  {
    key: "requests",
    label: "Requests",
    shortLabel: "Requests",
    icon: Calendar,
    description: "Browse and respond to pending requests",
  },
  {
    key: "view",
    label: "Your Contributions",
    shortLabel: "Contri.",
    icon: BarChart2,
    description: "Track your uploads and stats",
  },
  {
    key: "your-requests",
    label: "Your Requests",
    shortLabel: "Req.",
    icon: Eye,
    description: "Review your request history",
  },
];

const HelpModal = ({ onClose }) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-border/70 s-surface"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            How to use contribution system
          </h3>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 transition hover:bg-accent"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-4 py-4 sm:px-5">
          <div className="aspect-video overflow-hidden rounded-lg border border-border/70 bg-black">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Avo5435OVzY?si=s3Vju0YeXqDnQe7c"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            This short video demonstrates how to use the contribution system.
          </p>

          <div className="mt-5 rounded-lg border border-border/70 bg-muted/40 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <InfoIcon className="h-4 w-4" /> Points to note
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Before contributing, ensure a similar file does not already exist.",
                "For requests, only one file can be uploaded at a time and one accepted at a time.",
                "Users receive mail updates when uploaded files are accepted.",
                "Contribute to requests from your same cluster/semester where possible.",
                "All uploaded files are reviewed by admins before being published.",
              ].map((item, index) => (
                <li key={index} className="relative pl-4">
                  <span className="absolute left-0 top-0 text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MainContributionContent = ({ setDisableWorkSpace }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRank = location.state?.userRank;

  const [activeComponent, setActiveComponent] = useState("contribute");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isBottomBarVisible, hideBottomBar, showBottomBar } = useBottomBar();

  useEffect(() => {
    setDisableWorkSpace(true);
  }, [setDisableWorkSpace]);

  useEffect(() => {
    if (showHelpModal) {
      hideBottomBar("help-modal");
    } else {
      showBottomBar("help-modal");
    }

    return () => {
      showBottomBar("help-modal");
    };
  }, [showHelpModal, hideBottomBar, showBottomBar]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 925);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeComponent) ?? tabs[0],
    [activeComponent],
  );

  const renderComponent = () => {
    if (loading) {
      return (
        <div className="flex min-h-[340px] items-center justify-center">
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </div>
      );
    }

    if (activeComponent === "requests") {
      return <Requests />;
    }

    if (activeComponent === "view") {
      return <ViewContribution isOpen={true} userRank={userRank} />;
    }

    if (activeComponent === "your-requests") {
      return <ViewRequests />;
    }

    return <FileUploadSystem setDisableWorkSpace={setDisableWorkSpace} />;
  };

  return (
    <div
      className="mx-auto flex h-full w-full max-w-[72rem] flex-col px-3 pb-5 sm:px-6"
      style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 0.35rem)" }}
    >
      <div
        className={`grid min-h-0 flex-1 gap-3 ${isMobile ? "mt-0" : "mt-1"} lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]`}
      >
        {!isMobile && (
          <aside className="s-panel s-panel--tight grain self-start">
            <div className="s-side-head">
              <p className="s-label">Contribution workspace</p>
              <h1 className="s-h2" style={{ marginTop: "0.25rem" }}>
                {activeTab.label}
              </h1>
              <p className="s-body" style={{ marginTop: "0.5rem", fontSize: "0.9375rem" }}>
                {activeTab.description}
              </p>

              <div className="s-actions" style={{ marginTop: "0.75rem", gap: "0.75rem" }}>
                {typeof userRank === "number" && (
                  <p className="s-label">Rank #{userRank}</p>
                )}

                <button
                  type="button"
                  className="s-btn s-btn--sm s-btn--quiet"
                  onClick={() => setShowHelpModal(true)}
                  aria-label="Open contribution help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

            <nav>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeComponent === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    className="s-row"
                    aria-pressed={active}
                    style={{ paddingBlock: "1rem" }}
                    onClick={() => setActiveComponent(tab.key)}
                  >
                    <Icon className="s-icon h-5 w-5" />
                    <span className="min-w-0">
                      <span className="s-title block truncate">{tab.label}</span>
                      <span className="s-body block" style={{ fontSize: "0.875rem" }}>
                        {tab.description}
                      </span>
                    </span>
                    <span />
                  </button>
                );
              })}

              <button
                type="button"
                className="s-row s-row--exit"
                onClick={() => navigate("/")}
              >
                <LogOut className="h-5 w-5" />
                <span className="s-title">Exit workspace</span>
                <span />
              </button>
            </nav>
          </aside>
        )}

        <section
          className="s-panel s-panel--tight s-panel--scroll grain min-h-0"
        >
          {renderComponent()}
        </section>
      </div>

      {isMobile &&
        !loading &&
        isBottomBarVisible &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-1">
            <nav className="mx-auto grid w-full max-w-[27rem] grid-cols-5 items-center gap-1 rounded-lg border border-border/70 bg-background/80 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeComponent === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-none transition-all duration-200 ${
                      active
                        ? "bg-primary/90 text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                    }`}
                    onClick={() => setActiveComponent(tab.key)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate max-[360px]:hidden">
                      {tab.shortLabel}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-none text-rose-500 transition-all duration-200 hover:bg-rose-500/10"
                onClick={() => navigate("/")}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="truncate max-[360px]:hidden">Exit</span>
              </button>
            </nav>
          </div>,
          document.body,
        )}

      {isMobile && !loading && (
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="fixed right-[-14px] top-[calc(var(--app-nav-offset,88px)+0.2rem)] z-30 flex items-center rounded-l-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary shadow-sm"
          aria-label="Open contribution help"
        >
          <MessageCircleQuestionIcon className="mr-1.5 h-4 w-4" />
        </button>
      )}

      <AnimatePresence>
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

const MainContribution = ({ setDisableWorkSpace }) => {
  return (
    <BottomBarProvider>
      <MainContributionContent setDisableWorkSpace={setDisableWorkSpace} />
    </BottomBarProvider>
  );
};

export default MainContribution;
