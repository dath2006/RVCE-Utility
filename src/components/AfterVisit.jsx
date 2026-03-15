/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowRight,
  BookOpenText,
  FolderOpen,
  ExternalLink,
  Github,
  MessageSquarePlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import FeaturesSection from "./FeaturesSection";
import SelectionPopup from "./SelectionPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return doc.body.innerHTML;
}

function StatCard({ value, label, suffix = "", delay = 0, accentClass = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    const duration = 1100;
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card
        className={`rounded-[1.6rem] border-border/70 bg-card/90 shadow-sm backdrop-blur-sm ${accentClass}`}
      >
        <CardContent className="p-6">
          <p className="text-3xl font-semibold tracking-tight">
            {displayValue.toLocaleString()}
            {suffix}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AfterVisit({ showAuthCard, setShowAuthCard }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [msgId, setMsgId] = useState(() => localStorage.getItem("msgId") || "");
  const [announcement, setAnnouncement] = useState(null);
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
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

    return "A calmer home surface for RV Utility.";
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
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="h-full overflow-hidden rounded-[2rem] border-border/70 bg-card/85 shadow-soft backdrop-blur-xl">
            <CardContent className="p-8 sm:p-10">
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1 uppercase tracking-[0.22em]"
              >
                WELCOME
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {heroCopy}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Access resources, attendance, and community tools from one place
                with quick paths to the features you use most.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link to="/resources">
                    Open resources
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowAuthCard(!showAuthCard);
                      return;
                    }
                    window.location.assign("/attendance");
                  }}
                >
                  Attendance
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <StatCard
                  value={stats.totalResources}
                  label="Resources indexed"
                  suffix="+"
                  delay={0.05}
                  accentClass="bg-gradient-to-br from-cyan-500/10 to-transparent"
                />
                <StatCard
                  value={stats.totalVisits}
                  label="Portal visits"
                  suffix="+"
                  delay={0.1}
                  accentClass="bg-gradient-to-br from-emerald-500/10 to-transparent"
                />
                <StatCard
                  value={stats.verifiedUsers}
                  label="Verified users"
                  suffix="+"
                  delay={0.15}
                  accentClass="bg-gradient-to-br from-orange-500/10 to-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="grid gap-6"
        >
          <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Campus bulletin</CardTitle>
              <CardDescription className="leading-6">
                Important announcements and resource updates for students.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm leading-6 text-muted-foreground">
              <div>
                {showAnnouncement ? (
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Pinned update
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    Latest update
                  </Badge>
                )}
                {/* <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {announcement?.title ||
                    announcement?.headline ||
                    "Campus bulletin"}
                </h3> */}
                {isAnnouncementHtml ? (
                  <div
                    className="prose prose-sm mt-2 max-w-3xl text-foreground dark:prose-invert prose-headings:my-2 prose-p:my-2 prose-ul:my-2"
                    dangerouslySetInnerHTML={{ __html: safeAnnouncementHtml }}
                  />
                ) : (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {announcementBody}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {announcementLink && (
                  <Button asChild>
                    <a href={announcementLink} target="_blank" rel="noreferrer">
                      Open update
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {showAnnouncement && announcement?.id && (
                  <Button variant="outline" onClick={dismissAnnouncement}>
                    Dismiss
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Next useful actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:auto-rows-fr sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.02 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSelectionPopup(true)}
                  className="group h-full min-h-24 w-full justify-between rounded-2xl border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 px-4 py-3 text-left hover:border-sky-500/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="rounded-xl bg-sky-500/15 p-2.5">
                      <FolderOpen className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        Course filters
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Quick setup
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <Button
                  asChild
                  variant="outline"
                  className="h-full min-h-24 w-full rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-lime-500/5 p-0 hover:border-emerald-500/50"
                >
                  <Link to="/contributors">
                    <span className="group flex w-full items-center justify-between px-4 py-3 text-left">
                      <span className="flex items-center gap-3">
                        <span className="rounded-xl bg-emerald-500/15 p-2.5">
                          <Users className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            Contribute
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Share resources
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <Button
                  asChild
                  variant="outline"
                  className="h-full min-h-24 w-full rounded-2xl border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-0 hover:border-violet-500/50"
                >
                  <Link to="/essentials">
                    <span className="group flex w-full items-center justify-between px-4 py-3 text-left">
                      <span className="flex items-center gap-3">
                        <span className="rounded-xl bg-violet-500/15 p-2.5">
                          <BookOpenText className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            Essentials
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Daily quick tools
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <Button
                  asChild
                  variant="outline"
                  className="h-full min-h-24 w-full rounded-2xl border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-amber-500/5 p-0 hover:border-rose-500/50"
                >
                  <a
                    href="https://github.com/dath2006/RVCE-Utility"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="group flex w-full items-center justify-between px-4 py-3 text-left">
                      <span className="flex items-center gap-3">
                        <span className="rounded-xl bg-rose-500/15 p-2.5">
                          <Github className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            GitHub
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Track updates
                          </span>
                        </span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <FeaturesSection />

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

          <div className="max-h-[48vh] overflow-y-auto pr-1">
            {isAnnouncementHtml ? (
              <div
                className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:my-2 prose-p:my-2 prose-ul:my-2"
                dangerouslySetInnerHTML={{ __html: safeAnnouncementHtml }}
              />
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
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

      <section className="grid gap-6">
        <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Feedback loop</CardTitle>
            <CardDescription>
              Keep improving the portal together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              Report issues, suggest improvements, or add useful resources.
            </div>
            <Button asChild className="w-full rounded-full">
              <a
                href="https://forms.gle/wXMoTKkk1Lea8cMc6"
                target="_blank"
                rel="noreferrer"
              >
                Suggest an improvement
                <MessageSquarePlus className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/contributors">
                Join the contributor page
                <Users className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs leading-6 text-muted-foreground">
              {!isLoading && isAuthenticated
                ? "You are signed in, so protected surfaces like attendance are ready to use from the new landing shell."
                : "You are currently browsing as a guest. Use the avatar button in the header if you want to unlock attendance and account-linked flows."}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default AfterVisit;
