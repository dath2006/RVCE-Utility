/* eslint-disable react/prop-types */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Bot,
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  Compass,
  Github,
  Home,
  Moon,
  NotepadText,
  Star,
  Sun,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

import { useGithubStars } from "../hooks/useGithubStars";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/contributors", label: "Contribute", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck2, auth: true },
  { to: "/essentials", label: "Essentials", icon: Wrench },
];

const utilityItems = [
  {
    label: "ChatGPT",
    icon: Bot,
    action: () =>
      window.open("https://chat.openai.com", "_blank", "noopener,noreferrer"),
  },
  {
    label: "GitHub",
    icon: Github,
    action: () =>
      window.open(
        "https://github.com/dath2006/RVCE-Utility",
        "_blank",
        "noopener,noreferrer",
      ),
  },
  {
    label: "Notion",
    icon: NotepadText,
    action: () =>
      window.open("https://www.notion.so/", "_blank", "noopener,noreferrer"),
  },
];

const GITHUB_STAR_PROMPT_KEY = "rvce-github-star-prompt-done";

function Navigation({
  theme,
  toggleTheme,
  showTodoMenu,
  setShowTodoMenu,
  showAuthCard,
  setShowAuthCard,
}) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated } = useAuth0();
  const { stars } = useGithubStars();
  const [showStarPrompt, setShowStarPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isMobileUtilityOpen, setIsMobileUtilityOpen] = useState(false);
  const [isMobileNavDocked, setIsMobileNavDocked] = useState(false);
  const headerRef = useRef(null);
  const mobilePromptAutoOpenedRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const promptDone = localStorage.getItem(GITHUB_STAR_PROMPT_KEY) === "true";
    setShowStarPrompt(!promptDone);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const updateNavOffset = () => {
      if (!headerRef.current) return;

      const { bottom } = headerRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--app-nav-offset",
        `${Math.ceil(bottom + 8)}px`,
      );
    };

    updateNavOffset();
    window.addEventListener("resize", updateNavOffset);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateNavOffset)
        : null;

    if (observer && headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateNavOffset);
      observer?.disconnect();
    };
  }, []);

  const dismissStarPrompt = () => {
    localStorage.setItem(GITHUB_STAR_PROMPT_KEY, "true");
    setShowStarPrompt(false);
    setIsMobileUtilityOpen(false);
    mobilePromptAutoOpenedRef.current = false;
  };

  const isAfterVisitScreen =
    currentPath === "/" && Boolean(localStorage.getItem("filters"));

  const shouldShowStarPrompt = showStarPrompt && isAfterVisitScreen;

  const shouldShowMobileStarPrompt = isMobile && shouldShowStarPrompt;

  useEffect(() => {
    if (shouldShowMobileStarPrompt) {
      setIsMobileUtilityOpen(true);
      mobilePromptAutoOpenedRef.current = true;
      return;
    }

    if (mobilePromptAutoOpenedRef.current) {
      setIsMobileUtilityOpen(false);
      mobilePromptAutoOpenedRef.current = false;
    }
  }, [shouldShowMobileStarPrompt]);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");

    if (!isMobile || !scrollContainer) {
      setIsMobileNavDocked(false);
      lastScrollTopRef.current = 0;
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const delta = scrollTop - lastScrollTopRef.current;

      if (scrollTop <= 8) {
        setIsMobileNavDocked(false);
      } else if (delta > 1.5 && scrollTop > 24) {
        setIsMobileNavDocked(true);
      }

      lastScrollTopRef.current = scrollTop;
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, currentPath]);

  const handleProtectedNavigation = (item, event) => {
    if (item.auth && !isAuthenticated) {
      event.preventDefault();
      setShowAuthCard(!showAuthCard);
    }
  };

  const shouldUseDockedMobileNav = isMobile && isMobileNavDocked;

  return (
    <>
      {shouldShowStarPrompt && (
        <div className="pointer-events-none fixed inset-0 z-[80] hidden bg-black/45 backdrop-blur-[1px] sm:block" />
      )}

      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-all duration-300 ease-out sm:px-6",
          shouldUseDockedMobileNav ? "px-0 pt-0" : "px-3 pt-3",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between border border-border/70 bg-background/80 py-2 backdrop-blur-xl transition-all duration-300 ease-out",
            shouldUseDockedMobileNav
              ? "max-w-none rounded-none border-x-0 border-t-0 px-3 shadow-md shadow-black/10"
              : "max-w-7xl rounded-2xl px-3 shadow-lg shadow-black/5 sm:px-5",
          )}
        >
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-accent"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <img
                  src="/logo.svg"
                  alt="RV Utility logo"
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none tracking-tight">
                  RV Utility
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Study resources
                </p>
              </div>
            </Link>
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-gradient-to-r from-primary/10 via-background to-amber-300/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_10px_rgba(15,23,42,0.08)] sm:px-2.5 sm:text-[11px]"
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              Redesigned
            </Badge>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => {
                  const isActive =
                    item.to === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(item.to);

                  return (
                    <NavigationMenuItem key={item.to}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.to}
                          onClick={(event) =>
                            handleProtectedNavigation(item, event)
                          }
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent",
                            isActive && "bg-accent text-accent-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {stars !== null && (
              <div
                className={cn(
                  "relative hidden sm:block",
                  shouldShowStarPrompt && "z-[95]",
                )}
              >
                <a
                  href="https://github.com/dath2006/RVCE-Utility"
                  target="_blank"
                  rel="noreferrer"
                  onClick={dismissStarPrompt}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent",
                    shouldShowStarPrompt &&
                      "ring-2 ring-yellow-400/90 ring-offset-2 ring-offset-background shadow-[0_0_0_4px_rgba(250,204,21,0.22)]",
                  )}
                >
                  <Github className="h-4 w-4" />
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                    <span>{stars}</span>
                  </span>
                </a>

                {shouldShowStarPrompt && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="absolute -top-1 right-8 h-2 w-2 rotate-45 border-l border-t border-border bg-popover" />
                    <p className="text-sm font-medium">Finding this useful?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please star the GitHub repo to support the project.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="h-8" asChild>
                        <a
                          href="https://github.com/dath2006/RVCE-Utility"
                          target="_blank"
                          rel="noreferrer"
                          onClick={dismissStarPrompt}
                        >
                          Star now
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={dismissStarPrompt}
                      >
                        Already starred
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  Utility
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick tools</DropdownMenuLabel>
                {utilityItems.map((item) => (
                  <DropdownMenuItem key={item.label} onClick={item.action}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowTodoMenu(!showTodoMenu)}
                >
                  Todo list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu
              open={isMobileUtilityOpen}
              onOpenChange={setIsMobileUtilityOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open mobile utilities"
                >
                  <Compass className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[19rem] p-3 md:hidden"
              >
                <DropdownMenuLabel>Quick tools</DropdownMenuLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {utilityItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowTodoMenu(!showTodoMenu)}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>Todo list</span>
                  </button>

                  <a
                    href="https://github.com/dath2006/RVCE-Utility"
                    target="_blank"
                    rel="noreferrer"
                    onClick={dismissStarPrompt}
                    className={cn(
                      "relative flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent",
                      shouldShowMobileStarPrompt &&
                        "ring-2 ring-yellow-400/90 ring-offset-2 ring-offset-background shadow-[0_0_0_4px_rgba(250,204,21,0.22)]",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Github className="h-4 w-4" />
                      GitHub Stars
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                      <span>{stars ?? "--"}</span>
                    </span>
                  </a>
                </div>

                {shouldShowMobileStarPrompt && (
                  <div className="relative mt-3 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="absolute -top-1 right-10 h-2 w-2 rotate-45 border-l border-t border-border bg-popover" />
                    <p className="text-sm font-medium">Finding this useful?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please star the GitHub repo to support the project.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="h-8" asChild>
                        <a
                          href="https://github.com/dath2006/RVCE-Utility"
                          target="_blank"
                          rel="noreferrer"
                          onClick={dismissStarPrompt}
                        >
                          Star now
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={dismissStarPrompt}
                      >
                        Already starred
                      </Button>
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                toggleTheme(event.currentTarget);
              }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
              onClick={() => setShowAuthCard(!showAuthCard)}
              aria-label={
                isAuthenticated
                  ? `Open profile for ${user?.name || "user"}`
                  : "Open sign in"
              }
            >
              {isAuthenticated && user?.picture ? (
                <img
                  src={user.picture}
                  alt={user?.name || "User profile"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navigation;
