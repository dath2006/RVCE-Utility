import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FilePlus,
  Calendar,
  BarChart2,
  Eye,
  RefreshCw,
  Youtube,
  InfoIcon,
  LogOut,
  MessageCircleQuestionIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import WaveLoader from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { BottomBarProvider, useBottomBar } from "../contexts/BottomBarContext";

import ImportTimeTable from "../components/ImportTimeTable";
import CustomTimeTable from "../components/CustomTimeTable";
import MainAttendance from "../components/MainAttendance";
import PublishTimeTable from "../components/PublishTimeTable";
import Statistics from "../components/Statistics";
import ViewTimeTable from "../components/ViewTimeTable";

const shellFade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26 } },
};

const HelpModal = ({ onClose }) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <Youtube size={18} className="text-rose-500" />
            How to use attendance system
          </h3>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 transition hover:bg-accent"
            onClick={onClose}
            aria-label="Close help modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-4 py-4 sm:px-5">
          <div className="aspect-video overflow-hidden rounded-xl border border-border/70 bg-background/70">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/v71013_yw20?si=nfqNt_c_8SCj_o1w"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            This short walkthrough explains setup, daily marking, and tracking
            your progress.
          </p>

          <div className="mt-5 rounded-xl border border-border/70 bg-background/60 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <InfoIcon size={16} />
              Points to Note
            </h4>
            <ul className="space-y-2">
              {[
                "This attendance system is for your personal tracking reference.",
                "New classes start with pending status until marked.",
                "Clear pending attendance from academic start date for accurate statistics.",
                'Use "Ignore" for cancelled classes and holidays.',
                "Review custom entries carefully before saving.",
              ].map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  <span className="mr-2 text-primary">-</span>
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

const navConfig = {
  noTable: [
    {
      id: "import",
      label: "Import TimeTable",
      icon: FilePlus,
      kind: "primary",
    },
  ],
  withTable: [
    { id: "main", label: "Attendance", icon: Calendar, kind: "primary" },
    { id: "statistics", label: "Statistics", icon: BarChart2, kind: "primary" },
    { id: "view", label: "View TimeTable", icon: Eye, kind: "primary" },
    {
      id: "publish",
      label: "Publish TimeTable",
      icon: UploadCloud,
      kind: "primary",
    },
    { id: "reset", label: "Reset TimeTable", icon: RefreshCw, kind: "danger" },
  ],
};

const mobileActions = {
  noTable: [
    { id: "import", label: "Import", icon: FilePlus },
    { id: "exit", label: "Exit", icon: LogOut, danger: true },
  ],
  withTable: [
    { id: "main", label: "Attendance", icon: Calendar },
    { id: "statistics", label: "Stats", icon: BarChart2 },
    { id: "view", label: "View", icon: Eye },
    { id: "publish", label: "Publish", icon: UploadCloud },
    { id: "reset", label: "Reset", icon: RefreshCw },
    { id: "exit", label: "Exit", icon: LogOut, danger: true },
  ],
};

const CONSENT_REDIRECT_FLAG = "auth0_consent_redirect_in_progress";

const isConsentRequiredError = (error) => {
  const normalizedCode = String(
    error?.error || error?.code || "",
  ).toLowerCase();
  const normalizedMessage = String(error?.message || "").toLowerCase();
  return (
    normalizedCode === "consent_required" ||
    normalizedMessage.includes("consent required")
  );
};

// eslint-disable-next-line react/prop-types
const AttendanceContent = ({ setDisableWorkSpace }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [hasTimeTable, setHasTimeTable] = useState(false);
  const [activeComponent, setActiveComponent] = useState("import");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

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
  }, [showHelpModal]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      handleHasTimeTable();
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 925);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleHasTimeTable = async () => {
    if (!isLoading && isAuthenticated) {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        sessionStorage.removeItem(CONSENT_REDIRECT_FLAG);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/timetable/check?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.success) {
          const hasTable = res.data.hasTimeTable;
          setActiveComponent(hasTable ? "main" : "import");
          setShowHelpModal(!hasTable);
          setHasTimeTable(hasTable);
        }
      } catch (error) {
        if (isConsentRequiredError(error)) {
          if (sessionStorage.getItem(CONSENT_REDIRECT_FLAG) !== "1") {
            sessionStorage.setItem(CONSENT_REDIRECT_FLAG, "1");
            await loginWithRedirect({
              appState: {
                returnTo: `${window.location.pathname}${window.location.search}`,
              },
              authorizationParams: {
                audience: import.meta.env.VITE_API_URL,
                scope: "openid profile email offline_access",
                prompt: "consent",
              },
            });
          }
          return;
        }
        console.error("Error checking time table:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateTo = (componentName) => {
    setActiveComponent(componentName);
  };

  const handleCreateTimeTable = () => {
    setActiveComponent("custom");
  };

  const resetTimeTable = () => {
    setActiveComponent("import");
  };

  const desktopNavItems = hasTimeTable
    ? navConfig.withTable
    : navConfig.noTable;
  const mobileNavItems = hasTimeTable
    ? mobileActions.withTable
    : mobileActions.noTable;

  const performAction = (id) => {
    if (id === "reset") {
      resetTimeTable();
      return;
    }

    if (id === "exit") {
      navigate("/");
      return;
    }

    navigateTo(id);
  };

  const renderComponent = () => {
    if (loading) {
      return (
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border/70 bg-card/90 p-6">
          <WaveLoader
            size="7em"
            primaryColor="hsl(220,90%,50%)"
            secondaryColor="hsl(300,90%,50%)"
          />
        </div>
      );
    }

    switch (activeComponent) {
      case "import":
        return (
          <ImportTimeTable
            setActiveComponent={setActiveComponent}
            setHasTimeTable={setHasTimeTable}
            onCreateClick={handleCreateTimeTable}
          />
        );
      case "custom":
        return (
          <CustomTimeTable
            setActiveComponent={setActiveComponent}
            setHasTimeTable={setHasTimeTable}
            setShowHelpModal={setShowHelpModal}
          />
        );
      case "main":
        return <MainAttendance setActiveComponent={setActiveComponent} />;
      case "statistics":
        return <Statistics />;
      case "view":
        return <ViewTimeTable />;
      case "publish":
        return <PublishTimeTable />;
      default:
        return <ImportTimeTable onCreateClick={handleCreateTimeTable} />;
    }
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden pt-[73px]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_88%)]" />

      <div className="flex min-h-0 min-w-0 flex-1 gap-4 p-3 sm:p-4">
        {!isMobile && !loading && (
          <motion.aside
            initial="hidden"
            animate="visible"
            variants={shellFade}
            className="hidden w-72 shrink-0 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm md:block"
          >
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/80">
                Attendance Hub
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Plan. Mark. Improve.
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Same modern design language as Contributions, tuned for daily
                attendance flow.
              </p>
            </div>

            <nav className="space-y-2">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeComponent === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => performAction(item.id)}
                    className={`group flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      item.kind === "danger"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15"
                        : active
                          ? "border-primary/35 bg-primary/10 text-primary"
                          : "border-border/70 bg-background/80 hover:border-primary/25 hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        )}

        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-border/70 bg-card/80 shadow-sm">
          <div
            className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 ${isMobile ? "pb-16" : "pb-4"}`}
          >
            {renderComponent()}
          </div>
        </section>
      </div>

      {isMobile &&
        !loading &&
        isBottomBarVisible &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-1">
            <div
              className={`mx-auto grid w-full max-w-[27rem] ${mobileNavItems.length > 5 ? "grid-cols-6" : mobileNavItems.length > 4 ? "grid-cols-5" : "grid-cols-2"} items-center gap-1 rounded-2xl border border-border/70 bg-background/80 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl`}
            >
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeComponent === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => performAction(item.id)}
                    className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-none transition-all duration-200 ${
                      active
                        ? "bg-primary/90 text-primary-foreground shadow-sm"
                        : item.danger
                          ? "text-rose-500 hover:bg-rose-500/10"
                          : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                    <span className="truncate max-[360px]:hidden">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

      {!loading && !showHelpModal && (
        <button
          onClick={() => setShowHelpModal(true)}
          className={`fixed z-[110] inline-flex items-center gap-2 border border-primary/20 bg-primary/10 px-3 py-2 text-primary shadow-sm backdrop-blur transition hover:bg-primary/15 ${
            isMobile
              ? "right-0 top-24 rounded-l-full"
              : "right-5 top-[calc(73px+1rem)] rounded-full"
          }`}
          aria-label="Open help"
        >
          <MessageCircleQuestionIcon size={18} />
          {!isMobile && <span className="text-sm font-medium">Help</span>}
        </button>
      )}

      <AnimatePresence>
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const AttendanceSystem = ({ setDisableWorkSpace }) => {
  return (
    <BottomBarProvider>
      <AttendanceContent setDisableWorkSpace={setDisableWorkSpace} />
    </BottomBarProvider>
  );
};

export default AttendanceSystem;
