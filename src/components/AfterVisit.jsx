/* eslint-disable react/prop-types */

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowRight,
  BookOpenText,
  FolderOpen,
  ExternalLink,
  Users,
} from "lucide-react";

import SelectionPopup from "./SelectionPopup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  incrementVerifiedUserCount,
  incrementVisitCount,
  listenToHomeStats,
} from "../firebase";

function sanitizeBulletinHtml(rawHtml) {
  if (!rawHtml || typeof window === "undefined") {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  doc
    .querySelectorAll("script, style, iframe, object, embed, link, meta")
    .forEach((node) => {
      node.remove();
    });

  doc.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }

      if (
        (name === "href" || name === "src") &&
        /^\s*javascript:/i.test(value)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  doc.querySelectorAll("a").forEach((anchor) => {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noreferrer");
  });

  return doc.body.innerHTML;
}

const announcementHtmlClassName =
  "prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:mb-2 prose-headings:mt-3 prose-headings:font-semibold prose-p:my-2 prose-p:leading-7 prose-ul:my-2 prose-li:my-1 prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline prose-blockquote:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-sky-300 prose-blockquote:bg-sky-50/70 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:text-slate-700 dark:prose-blockquote:bg-slate-900/40";

function AfterVisit({ showAuthCard, setShowAuthCard }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth0();
  const [msgId, setMsgId] = useState(() => localStorage.getItem("msgId") || "");
  const [announcement, setAnnouncement] = useState(null);
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const bulletinRef = useRef(null);
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [bulletinOverflows, setBulletinOverflows] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    verifiedUsers: 0,
    totalResources: 0,
  });

  useEffect(() => {
    if (!sessionStorage.getItem("visited_v2")) {
      incrementVisitCount();
      sessionStorage.setItem("visited_v2", "true");
    }

    const unsubscribe = listenToHomeStats((data) => {
      setStats(data);
      setIsStatsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !sessionStorage.getItem("verified_counted")) {
      incrementVerifiedUserCount();
      sessionStorage.setItem("verified_counted", "true");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    async function getAnnouncement() {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/RVCE-Utility/rvce-utility-file/refs/heads/main/infoCard.json",
        );
        setAnnouncement(response.data?.[0] || null);
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    }

    getAnnouncement();
  }, []);

  const heroCopy = useMemo(() => {
    if (isAuthenticated && user?.name) {
      return `Welcome back, ${user.name.split(" ")[0]}.`;
    }

    return "Your RVCE study desk.";
  }, [isAuthenticated, user]);

  const announcementLink =
    announcement?.url || announcement?.link || announcement?.webViewLink;
  const announcementBody =
    announcement?.content ||
    announcement?.message ||
    announcement?.description ||
    "Latest campus and portal updates are shown here.";
  const isAnnouncementHtml = /<\/?[a-z][\s\S]*>/i.test(announcementBody);
  const safeAnnouncementHtml = useMemo(
    () => sanitizeBulletinHtml(announcementBody),
    [announcementBody],
  );
  const showAnnouncement = announcement && announcement?.id !== msgId;

  useEffect(() => {
    const el = bulletinRef.current;
    if (!el) return undefined;

    const measure = () => setBulletinOverflows(el.offsetHeight > 256);
    measure();

    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [announcementBody, safeAnnouncementHtml]);

  const dismissAnnouncement = () => {
    if (!announcement?.id) return;

    localStorage.setItem("msgId", announcement.id);
    setMsgId(announcement.id);
    setShowAnnouncementPopup(false);
  };

  useEffect(() => {
    if (showAnnouncement && announcement?.id) {
      setShowAnnouncementPopup(true);
    }
  }, [showAnnouncement, announcement?.id]);

  return (
    <div className="s-wrap">
      <section className="s-hero">
        <div className="s-stack">
          <h1 className="s-display">{heroCopy}</h1>
          <p className="s-lead">
            Resources, attendance, and community tools in one place.
          </p>
          <div className="s-actions">
            <Link to="/resources" className="s-btn">
              Open resources
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="s-link"
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthCard(!showAuthCard);
                  return;
                }
                window.location.assign("/attendance");
              }}
            >
              Attendance
            </button>
          </div>
        </div>

        <div className="s-panel grain">
          <div className="s-section-head" style={{ marginBottom: 0 }}>
            <h2 className="s-title">Campus bulletin</h2>
            <span className="s-label">
              {showAnnouncement ? "Pinned update" : "Latest update"}
            </span>
          </div>
          <div
            className={`s-bulletin ${bulletinOpen ? "" : "s-bulletin--clamped"} ${bulletinOverflows && !bulletinOpen ? "s-bulletin--fade" : ""}`}
          >
            <div ref={bulletinRef}>
              {isAnnouncementHtml ? (
                <div
                  className={announcementHtmlClassName}
                  dangerouslySetInnerHTML={{ __html: safeAnnouncementHtml }}
                />
              ) : (
                <p className="s-body" style={{ whiteSpace: "pre-line" }}>
                  {announcementBody}
                </p>
              )}
            </div>
          </div>
          {bulletinOverflows && (
            <button
              type="button"
              className="s-link"
              style={{ marginTop: "0.75rem", fontSize: "0.9375rem" }}
              aria-expanded={bulletinOpen}
              onClick={() => setBulletinOpen((open) => !open)}
            >
              {bulletinOpen ? "Show less" : "Read full update"}
            </button>
          )}
          {(announcementLink || (showAnnouncement && announcement?.id)) && (
            <div className="s-actions" style={{ marginTop: "1.25rem" }}>
              {announcementLink && (
                <a
                  href={announcementLink}
                  target="_blank"
                  rel="noreferrer"
                  className="s-btn"
                >
                  Open update
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {showAnnouncement && announcement?.id && (
                <button
                  type="button"
                  className="s-link"
                  onClick={dismissAnnouncement}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="s-section">
        <div className="s-section-head">
          <h2 className="s-h2">Jump in</h2>
          {!isStatsLoading && stats.totalResources > 0 && (
            <p className="s-label">
              {stats.totalResources.toLocaleString()}+ resources indexed
            </p>
          )}
        </div>
        <ul className="s-rows s-panel s-panel--sand s-panel--flush grain">
          <li>
            <button
              type="button"
              className="s-row"
              onClick={() => setShowSelectionPopup(true)}
            >
              <FolderOpen className="s-icon h-5 w-5" />
              <span>
                <span className="s-title block">Course filters</span>
                <span className="s-body block">Quick setup</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </li>
          <li>
            <Link to="/contributors" className="s-row">
              <Users className="s-icon h-5 w-5" />
              <span>
                <span className="s-title block">Contribute</span>
                <span className="s-body block">Share resources</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link to="/essentials" className="s-row">
              <BookOpenText className="s-icon h-5 w-5" />
              <span>
                <span className="s-title block">Essentials</span>
                <span className="s-body block">Daily quick tools</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        </ul>
      </section>

      <Dialog
        open={showAnnouncementPopup}
        onOpenChange={setShowAnnouncementPopup}
      >
        <DialogContent className="max-h-[85vh] overflow-hidden rounded-2xl border-border/70 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">New campus update</DialogTitle>
            <DialogDescription>
              Important announcements and resource updates for students.
            </DialogDescription>
          </DialogHeader>

          <div className="s-scroll max-h-[48vh] overflow-y-auto pr-2">
            {isAnnouncementHtml ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div
                  className={announcementHtmlClassName}
                  dangerouslySetInnerHTML={{ __html: safeAnnouncementHtml }}
                />
              </div>
            ) : (
              <p className="whitespace-pre-line rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                {announcementBody}
              </p>
            )}
          </div>

          <DialogFooter>
            {announcementLink && (
              <Button asChild>
                <a
                  href={announcementLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={dismissAnnouncement}
                >
                  Open update
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={dismissAnnouncement}>
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSelectionPopup && (
        <SelectionPopup
          onClose={() => setShowSelectionPopup(false)}
          onSubmit={(selectedFilters) => {
            localStorage.setItem("filters", JSON.stringify(selectedFilters));
            navigate("/resources");
          }}
        />
      )}

    </div>
  );
}

export default AfterVisit;
