/* eslint-disable react/prop-types */

import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { BookOpen, CalendarCheck2, Home, Users, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigation } from "../contexts/NavigationContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/contributors", label: "Contribute", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck2, auth: true },
  { to: "/essentials", label: "Essentials", icon: Wrench },
];

function BottomBar({ setShowAuthCard, showAuthCard }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuthenticated } = useAuth0();
  const { hideNavigation, activeOverlays } = useNavigation();

  const blockingOverlays = new Set([
    "fileViewer",
    "resourcesFileViewer",
    "workspace",
    "todoMenu",
    "authCard",
    "mobileMenu",
    "essentials",
    "filterDialog",
  ]);

  const hasBlockingOverlay = activeOverlays.some((id) =>
    blockingOverlays.has(id),
  );

  const shouldHide =
    currentPath.startsWith("/attendance") ||
    currentPath.startsWith("/contribute") ||
    hideNavigation ||
    hasBlockingOverlay;

  if (shouldHide) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-1 md:hidden">
      <nav className="mx-auto grid w-full max-w-[27rem] grid-cols-5 items-center gap-1 rounded-2xl border border-border/70 bg-background/80 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={(event) => {
                if (item.auth && !isAuthenticated) {
                  event.preventDefault();
                  setShowAuthCard(!showAuthCard);
                }
              }}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-none transition-all duration-200",
                isActive
                  ? "bg-primary/90 text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate max-[360px]:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>,
    document.body,
  );
}

export default BottomBar;
