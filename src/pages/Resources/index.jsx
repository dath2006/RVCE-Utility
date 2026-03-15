import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSearchParams } from "react-router-dom";
import FileExplorer from "./FileExplorer";
import BreadCrumbs from "./BreadCrumbs";
import SearchBar from "./SearchBar";
import searchFiles from "../../hooks/searchFiles";
import { motion } from "framer-motion";
import searchFolderStructure from "../../hooks/searchFolders";
import SelectionPopup from "../../components/SelectionPopup";
import { WindowProvider } from "../../components/FileViewer/WindowContext";
import WaveLoader from "../../components/Loading";
import axios from "axios";
import { FilterList } from "@mui/icons-material";
import { useOverlay } from "../../contexts/NavigationContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const RECENT_FILES_KEY = "resources_recent_files";
const RESOURCES_FOCUS_KEY = "rvce-resources-focus-v1";

const Resources = ({ screenSize, setDisableWorkSpace }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPath = useMemo(() => {
    const p = searchParams.get("path");
    return p ? p.split("/").filter(Boolean) : [];
  }, [searchParams]);

  const navigateTo = useCallback(
    (newPath) => {
      setSearchParams(newPath.length > 0 ? { path: newPath.join("/") } : {});
    },
    [setSearchParams],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [recentFiles, setRecentFiles] = useState(() => {
    const saved = localStorage.getItem(RECENT_FILES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [recentOpenRequest, setRecentOpenRequest] = useState(null);
  const recentPopupRef = useRef(null);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved ? JSON.parse(saved) : null;
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobilePortrait, setIsMobilePortrait] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px) and (orientation: portrait)")
      .matches;
  });
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isHeaderManuallyExpanded, setIsHeaderManuallyExpanded] =
    useState(false);
  const [focusStep, setFocusStep] = useState(null);
  const lastScrollTopRef = useRef(0);

  useOverlay("filterDialog", showFilterDialog);
  useOverlay("recentPopup", showRecentPopup);

  const handleShowFolders = useCallback(() => {
    if (!jsonData || jsonData.length === 0) {
      return;
    }
    if (!filters) {
      setFilteredFolders(jsonData);
      return;
    }

    let arr = [];
    if (filters.cycle === "C - Cycle") {
      [
        "Question Papers",
        "Chemistry (22CHY12A)",
        "CAEG (ME112GL)",
        "Yoga (22HSY18)",
        "Indian Constitution (22HSE16)",
        "Maths (22MA11C)",
        filters.selectedESC,
        filters.selectedPLC,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data),
          );
        }
      });
    } else if (filters.cycle === "P - Cycle") {
      [
        "Mechanical Engineering",
        "Basic Electronics",
        "Physics (22PHY22C)",
        "Idea lab (22ME28)",
        "Principles of C prog (22CS23)",
        "Maths (22MA21C)",
        "AI_Foundations_For_Engineers (CI124AT)",
        filters.selectedETC,
        filters.selectedKannada,
        filters.selectedESC,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data),
          );
        }
      });
    } else if (filters.cycle === "3-Sem-CSE") {
      [
        "OS (CS235AI)",
        "Maths (MAT231CT)",
        "DTL (CS237DL)",
        "DSA (IS233AI)",
        "ADLD (CS234AI)",
        filters.selectedSem3,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data),
          );
        }
      });
    } else if (filters.cycle === "3-Sem-ECE") {
      ["network", "Maths ECE", "digital", "analog"].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data),
          );
        }
      });
    } else if (filters.cycle === "4-Sem-CSE") {
      [
        "UHV (HS248AT)",
        "IOT (CS344AI)",
        "DSE (CS246TG) [NPTEL]",
        "DMS (CS241AT)",
        "DAA (CD343AI)",
        "CN (CY245AT)",
        "AEC (MUSIC)",
        filters.selectedSem4,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data),
          );
        }
      });
    } else if (filters.cycle === "4-Sem-ECE") {
      const semScope = searchFolderStructure("4-Sem-ECE", jsonData);
      [
        "UHV",
        "TL & EMW",
        "Signals And Systems",
        "NPTEL DBMS",
        "MCP",
        "Maths",
        "Extra Resources",
        "BIOSAFETY",
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(
            sub,
            semScope.length ? semScope : jsonData,
          ).forEach((data) => arr.push(data));
        }
      });
    } else if (filters.cycle === "5-Sem-CSE") {
      const semScope = searchFolderStructure("5-Sem-CSE", jsonData);
      ["TOC", "POME", "DBMS", "CC", "AIML"].forEach((sub) => {
        if (sub) {
          searchFolderStructure(
            sub,
            semScope.length ? semScope : jsonData,
          ).forEach((data) => arr.push(data));
        }
      });
    } else if (filters.cycle === "6-Sem-AIML-CSE") {
      const semScope = searchFolderStructure("6-Sem-AIML-CSE", jsonData);
      [
        "HS361TA-(EIPR)",
        "AI365TDD-(GenAI)",
        "AI364TA-Cloud Computing",
        "AI363IA-(NLP)",
        "AI362IA-(BDT)",
        filters.selectedInstitutionalElective,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(
            sub,
            semScope.length ? semScope : jsonData,
          ).forEach((data) => arr.push(data));
        }
      });
    }
    setFilteredFolders(arr);
  }, [jsonData, filters]);

  useEffect(() => {
    setDisableWorkSpace(false);
    getFiles();
  }, [setDisableWorkSpace]);

  useEffect(() => {
    const hasSeenFocus = localStorage.getItem(RESOURCES_FOCUS_KEY) === "true";
    if (!hasSeenFocus) {
      setFocusStep("filters");
    }
  }, []);

  useEffect(() => {
    handleShowFolders();
  }, [filters, jsonData, handleShowFolders]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredFiles([...searchFiles(searchQuery, filteredFolders)]);
    } else {
      setFilteredFiles([]);
    }
  }, [searchQuery, filteredFolders]);

  useEffect(() => {
    if (!showRecentPopup) {
      return;
    }

    const saved = localStorage.getItem(RECENT_FILES_KEY);
    setRecentFiles(saved ? JSON.parse(saved) : []);
  }, [showRecentPopup]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(max-width: 768px) and (orientation: portrait)",
    );

    const updateLayoutMode = () => {
      const nextValue = mediaQuery.matches;
      setIsMobilePortrait(nextValue);
      if (!nextValue) {
        setIsHeaderCollapsed(false);
        setIsHeaderManuallyExpanded(false);
      }
    };

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);
    window.addEventListener("resize", updateLayoutMode);

    return () => {
      mediaQuery.removeEventListener("change", updateLayoutMode);
      window.removeEventListener("resize", updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer || !isMobilePortrait) {
      setIsHeaderCollapsed(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const delta = scrollTop - lastScrollTopRef.current;

      if (scrollTop <= 8) {
        setIsHeaderCollapsed(false);
        setIsHeaderManuallyExpanded(false);
        lastScrollTopRef.current = scrollTop;
        return;
      }

      // Collapse only on deliberate downward scroll past threshold.
      if (delta > 1 && scrollTop > 40 && !isHeaderManuallyExpanded) {
        setIsHeaderCollapsed(true);
      }

      // Re-open automatically only when user reaches near the top.
      if (delta < -1 && scrollTop < 18 && isHeaderCollapsed) {
        setIsHeaderCollapsed(false);
      }

      lastScrollTopRef.current = scrollTop;
    };

    scrollContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isMobilePortrait, isHeaderManuallyExpanded]);

  useEffect(() => {
    if (isHeaderCollapsed) {
      setShowRecentPopup(false);
    }
  }, [isHeaderCollapsed]);

  useEffect(() => {
    if (focusStep && isMobilePortrait && isHeaderCollapsed) {
      setIsHeaderCollapsed(false);
      setIsHeaderManuallyExpanded(true);
    }
  }, [focusStep, isMobilePortrait, isHeaderCollapsed]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        showRecentPopup &&
        recentPopupRef.current &&
        !recentPopupRef.current.contains(event.target)
      ) {
        setShowRecentPopup(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [showRecentPopup]);

  const handleOpenRecent = (recent) => {
    setRecentOpenRequest({ ...recent, openedAt: Date.now() });
    setShowRecentPopup(false);
  };

  const handleClearRecent = () => {
    localStorage.removeItem(RECENT_FILES_KEY);
    setRecentFiles([]);
  };

  const handleExpandMobileHeader = () => {
    setIsHeaderCollapsed(false);
    setIsHeaderManuallyExpanded(true);
  };

  const finishFocusGuide = () => {
    localStorage.setItem(RESOURCES_FOCUS_KEY, "true");
    setFocusStep(null);
  };

  const handleFocusNext = () => {
    if (focusStep === "filters") {
      setFocusStep("recent");
      return;
    }
    finishFocusGuide();
  };

  async function getFiles() {
    setLoading(true);

    try {
      const res = await axios.get(import.meta.env.VITE_FILES_URL);
      const data = res.data;

      setJsonData(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }

  return loading ? (
    <motion.div className="flex min-h-[400px] items-center justify-center">
      <WaveLoader
        size="7em"
        primaryColor="hsl(220,90%,50%)"
        secondaryColor="hsl(300,90%,50%)"
      />
    </motion.div>
  ) : (
    <WindowProvider>
      {focusStep && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px]" />
      )}

      <div
        className="mx-auto flex h-full w-full max-w-7xl flex-col px-3 pb-4 sm:px-6 lg:px-8"
        style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 0.4rem)" }}
      >
        <motion.header
          className="sticky z-40 rounded-2xl border border-border/70 bg-background/85 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-4"
          style={{ top: "var(--app-nav-offset, 88px)" }}
          animate={{
            y: isMobilePortrait && isHeaderCollapsed ? -8 : 0,
            borderTopLeftRadius:
              isMobilePortrait && isHeaderCollapsed ? 12 : 16,
            borderTopRightRadius:
              isMobilePortrait && isHeaderCollapsed ? 12 : 16,
          }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <BreadCrumbs path={currentPath} onNavigate={navigateTo} />
            </div>

            {isMobilePortrait && isHeaderCollapsed && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                aria-label="Expand resource controls"
                onClick={handleExpandMobileHeader}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>

          <motion.div
            initial={false}
            animate={{
              height: isMobilePortrait && isHeaderCollapsed ? 0 : "auto",
              opacity: isMobilePortrait && isHeaderCollapsed ? 0 : 1,
              marginTop: isMobilePortrait && isHeaderCollapsed ? 0 : 8,
            }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-auto md:shrink-0"
            style={{
              pointerEvents:
                isMobilePortrait && isHeaderCollapsed ? "none" : "auto",
              overflow:
                isMobilePortrait && isHeaderCollapsed ? "hidden" : "visible",
            }}
          >
            <div className="w-full">
              <div
                className="relative flex w-full items-center gap-2"
                ref={recentPopupRef}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    focusStep === "recent" &&
                      "relative z-50 ring-2 ring-primary/90 ring-offset-2 ring-offset-background shadow-[0_0_0_4px_rgba(56,189,248,0.25)]",
                  )}
                  onClick={() => {
                    setShowRecentPopup((prev) => !prev);
                    if (focusStep === "recent") {
                      finishFocusGuide();
                    }
                  }}
                  aria-label="Open recently viewed files"
                >
                  <Clock3 className="h-4 w-4" />
                </Button>

                {focusStep === "recent" && (
                  <div className="absolute left-0 top-12 z-50 w-[min(88vw,320px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="absolute -top-1 left-5 h-2 w-2 rotate-45 border-l border-t border-border bg-popover" />
                    <p className="text-sm font-medium">Recently opened files</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tap this clock icon anytime to quickly reopen files you
                      viewed recently.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={finishFocusGuide}
                      >
                        Got it
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={finishFocusGuide}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}

                {showRecentPopup && (
                  <div className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] rounded-xl border border-border/70 bg-popover p-2 text-popover-foreground shadow-xl">
                    <div className="mb-2 flex items-center justify-between px-2 pt-1">
                      <p className="text-sm font-semibold">Recently Viewed</p>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="text-xs text-muted-foreground transition hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                      {recentFiles.length === 0 ? (
                        <div className="rounded-lg px-3 py-5 text-center text-sm text-muted-foreground">
                          No recent files yet.
                        </div>
                      ) : (
                        recentFiles.map((recent) => (
                          <button
                            key={recent.id}
                            type="button"
                            onClick={() => handleOpenRecent(recent)}
                            className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-border hover:bg-accent/40"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {recent.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {recent.parentName ||
                                  recent.path?.[0] ||
                                  "Resources"}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    focusStep === "filters" &&
                      "relative z-50 ring-2 ring-primary/90 ring-offset-2 ring-offset-background shadow-[0_0_0_4px_rgba(250,204,21,0.25)]",
                  )}
                  onClick={() => {
                    setShowFilterDialog(true);
                    if (focusStep === "filters") {
                      handleFocusNext();
                    }
                  }}
                  aria-label="Open filters"
                >
                  <FilterList style={{ fontSize: 18 }} />
                </Button>

                {focusStep === "filters" && (
                  <div className="absolute right-0 top-12 z-50 w-[min(88vw,320px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="absolute -top-1 right-5 h-2 w-2 rotate-45 border-l border-t border-border bg-popover" />
                    <p className="text-sm font-medium">
                      Change course selection
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use this filter button to pick your cycle/semester and
                      keep resources tailored to your courses.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={handleFocusNext}
                      >
                        Next
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={finishFocusGuide}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.header>

        <div className="mt-3 flex-1 pb-2">
          {searchQuery && filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="py-8 text-center text-lg text-muted-foreground"
            >
              No files found for "{searchQuery}"
            </motion.div>
          ) : (
            <FileExplorer
              key={refreshKey}
              currentPath={currentPath}
              searchQuery={searchQuery}
              filteredFiles={filteredFiles}
              onPathChange={navigateTo}
              rootFolders={filteredFolders}
              recentOpenRequest={recentOpenRequest}
            />
          )}
        </div>

        {showFilterDialog && (
          <SelectionPopup
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onSubmit={(selectedFilters) => {
              setFilters(selectedFilters);
              localStorage.setItem("filters", JSON.stringify(selectedFilters));
              setShowFilterDialog(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
      </div>
    </WindowProvider>
  );
};

export default Resources;
