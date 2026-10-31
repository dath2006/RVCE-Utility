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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]"
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
        className="s-dialog w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <Youtube size={18} className="text-destructive" />
            How to use attendance system
          </h3>
          <button
            type="button"
            className="s-iconbtn"
            onClick={onClose}
            aria-label="Close help modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="s-scroll max-h-[78vh] overflow-y-auto px-4 py-4 sm:px-5">
          <div className="aspect-video overflow-hidden rounded-lg border border-border/70 bg-background/70">
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

          <div className="mt-5 rounded-lg border border-border/70 bg-background/60 p-4">
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
        <div className="s-surface flex min-h-[360px] items-center justify-center rounded-lg p-6">
          <WaveLoader
            size="7em"
            primaryColor="hsl(var(--primary))"
            secondaryColor="hsl(var(--sage))"
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
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden pt-[4.5rem]">
      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-[72rem] flex-1 gap-6 p-3 sm:p-4">
        {!isMobile && !loading && (
          <motion.aside
            initial="hidden"
            animate="visible"
            variants={shellFade}
            className="s-panel s-panel--tight grain hidden w-72 shrink-0 self-start md:block"
          >
            <div className="s-side-head">
              <h2 className="s-h2">Plan. Mark. Improve.</h2>
              <p
                className="s-body"
                style={{ marginTop: "0.5rem", fontSize: "0.9375rem" }}
              >
                Plan your classes, mark them daily, and track your progress.
              </p>
            </div>

            <nav>
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeComponent === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => performAction(item.id)}
                    aria-pressed={active}
                    className={`s-row s-row--nav ${item.kind === "danger" ? "s-row--exit" : ""}`}
                  >
                    <Icon className="s-icon h-5 w-5" />
                    <span className="s-title">{item.label}</span>
                    <span />
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        )}

        <section className="s-panel s-panel--bare grain flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className={`s-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 ${isMobile ? "pb-16" : "pb-4"}`}
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
              className={`s-surface mx-auto grid w-full max-w-[27rem] ${mobileNavItems.length > 5 ? "grid-cols-6" : mobileNavItems.length > 4 ? "grid-cols-5" : "grid-cols-2"} items-center gap-1 rounded-lg p-1.5 backdrop-blur-xl`}
            >
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeComponent === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => performAction(item.id)}
                    className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[11px] font-medium leading-none transition-colors duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : item.danger
                          ? "text-destructive hover:bg-destructive/10"
                          : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
          className={`s-chip fixed z-[110] ${
            isMobile
              ? "right-0 top-24 rounded-r-none"
              : "right-5 top-[calc(4.5rem+1rem)]"
          }`}
          aria-label="Open help"
        >
          <MessageCircleQuestionIcon size={18} />
          {!isMobile && <span>Help</span>}
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
