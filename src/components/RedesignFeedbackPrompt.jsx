import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

import { submitRedesignFeedback } from "../firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FEEDBACK_STORAGE_KEY = "rvce-redesign-feedback-v1";
const FEEDBACK_VERSION = "redesign-2026-v1";

const MIN_ACTIVE_MS = 3 * 60 * 1000;
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function createDefaultState() {
  const now = Date.now();
  return {
    firstSeenAt: now,
    activeMs: 0,
    actions: 0,
    pagesVisited: [],
    lastShownAt: 0,
    dismissedUntil: 0,
    submittedAt: 0,
    submittedVersion: null,
  };
}

function readState() {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed = JSON.parse(raw);
    return {
      ...createDefaultState(),
      ...parsed,
      pagesVisited: Array.isArray(parsed?.pagesVisited)
        ? parsed.pagesVisited.slice(0, 12)
        : [],
    };
  } catch {
    return createDefaultState();
  }
}

function persistState(next) {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
}

function canShowPrompt(state, now) {
  if (state.submittedVersion === FEEDBACK_VERSION) return false;
  if (state.dismissedUntil && now < state.dismissedUntil) return false;
  if (state.lastShownAt && now - state.lastShownAt < SHOW_COOLDOWN_MS) {
    return false;
  }
  if (state.activeMs < MIN_ACTIVE_MS) return false;
  return true;
}

function RedesignFeedbackPrompt({ user, isAuthenticated }) {
  const location = useLocation();
  const [state, setState] = useState(() => readState());
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAfterVisitHome =
    location.pathname === "/" && Boolean(localStorage.getItem("filters"));

  const updateState = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistState(next);
      return next;
    });
  };

  useEffect(() => {
    const path = location.pathname;

    updateState((prev) => {
      if (prev.pagesVisited.includes(path)) return prev;

      return {
        ...prev,
        pagesVisited: [...prev.pagesVisited, path].slice(-12),
        actions: prev.actions + 1,
      };
    });
  }, [location.pathname]);

  useEffect(() => {
    let intervalId;

    const tickActiveTime = () => {
      updateState((prev) => ({
        ...prev,
        activeMs: prev.activeMs + 5000,
      }));
    };

    if (!document.hidden) {
      intervalId = window.setInterval(tickActiveTime, 5000);
    }

    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(intervalId);
      } else {
        window.clearInterval(intervalId);
        intervalId = window.setInterval(tickActiveTime, 5000);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const now = Date.now();

    if (!isAfterVisitHome || isOpen || !canShowPrompt(state, now)) {
      return;
    }

    setIsOpen(true);
    updateState((prev) => ({
      ...prev,
      lastShownAt: now,
    }));
  }, [isAfterVisitHome, state, isOpen]);

  const engagementSummary = useMemo(
    () => ({
      activeMs: state.activeMs,
      actions: state.actions,
      pagesVisited: state.pagesVisited,
    }),
    [state.activeMs, state.actions, state.pagesVisited],
  );

  const handleLater = () => {
    const now = Date.now();
    setIsOpen(false);
    setRating(0);
    setSuggestion("");

    updateState((prev) => ({
      ...prev,
      dismissedUntil: now + REMIND_AFTER_MS,
    }));
  };

  const handleSubmit = async () => {
    if (!rating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitRedesignFeedback({
        rating,
        suggestion,
        userId: isAuthenticated ? user?.sub || null : null,
        email: isAuthenticated ? user?.email || null : null,
        name: isAuthenticated ? user?.name || null : null,
        page: location.pathname,
        version: FEEDBACK_VERSION,
        engagement: engagementSummary,
      });

      const now = Date.now();
      updateState((prev) => ({
        ...prev,
        submittedAt: now,
        submittedVersion: FEEDBACK_VERSION,
      }));

      setIsOpen(false);
      setRating(0);
      setSuggestion("");
      toast.success("Thanks for rating the redesign.");
    } catch (error) {
      toast.error("Could not submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleLater();
        }
      }}
    >
      <DialogContent className="rounded-2xl border-border/70 sm:max-w-md">
        <DialogHeader>
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            Redesign feedback
          </Badge>
          <DialogTitle className="mt-2 text-2xl">
            How was the new design?
          </DialogTitle>
          <DialogDescription>
            Rate it out of 5. Suggestion is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                onClick={() => setRating(starValue)}
                className={cn(
                  "rounded-xl p-1.5 transition",
                  starValue <= rating
                    ? "scale-105"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    starValue <= rating
                      ? "fill-amber-400 text-amber-500"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="redesign-suggestion"
              className="inline-flex items-center gap-2 text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              Suggestion (optional)
            </label>
            <textarea
              id="redesign-suggestion"
              value={suggestion}
              onChange={(event) =>
                setSuggestion(event.target.value.slice(0, 500))
              }
              placeholder="What should we improve next?"
              className="min-h-[96px] w-full resize-none rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleLater}>
              Maybe later
            </Button>
            <Button onClick={handleSubmit} disabled={!rating || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RedesignFeedbackPrompt;
