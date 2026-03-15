import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookA,
  BookOpen,
  Calculator,
  Calendar,
  Code,
  ExternalLink,
  Github,
  Heart,
  Languages,
  Mail,
  Play,
  Scale,
  Sparkles,
  Star,
} from "lucide-react";

import FileViewer from "../components/FileViewer";
import { useOverlay } from "../contexts/NavigationContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const BASE_URL = "https://rvceutility-quizzes.netlify.app";

const subjects = {
  "Indian Constitution": {
    slug: "indian-constitution",
    icon: Scale,
    chapters: [
      { slug: "unit1", title: "Unit - 1" },
      { slug: "unit2", title: "Unit - 2" },
      { slug: "unit3", title: "Unit - 3" },
    ],
  },
  "Balake Kannada": {
    slug: "balake-kannada",
    icon: BookA,
    chapters: [
      { slug: "module1", title: "Module - 1" },
      { slug: "module2", title: "Module - 2" },
      { slug: "module3", title: "Module - 3" },
    ],
  },
  "Samskruthika Kannada": {
    slug: "samskruthika-kannada",
    icon: Languages,
    chapters: [
      { slug: "mankutimmana-kagga", title: "ಮಂಕುತಿಮ್ಮನ ಕಗ್ಗ" },
      { slug: "vachanagalu", title: "ವಚನಗಳು" },
      { slug: "kara-kusha", title: "ಕರಕುಶ" },
      {
        slug: "karnatakada-yekikarana",
        title: "ಕರ್ನಾಟಕದ ಏಕೀಕರಣ ಒಂದು ಅಪೂರ್ವ ಚರಿತ್",
      },
      { slug: "adalitha-bhashe-kannada", title: "ಆಡಳಿತ ಭಾಷೆಯಾಗಿ ಕನ್ನಡ" },
      { slug: "keertanegalu", title: "ಕೀರ್ತನೆಗಳು" },
      {
        slug: "vishveshwarayya",
        title: "ಡಾ. ವಿಶ್ವೇಶ್ವರಯ್ಯ: ವ್ಯಕ್ತಿ ಮತ್ತು ಐತಿಹ್ಯ",
      },
      { slug: "hosa-balina-geethe", title: "ಹೊಸ ಬಾಳಿನ ಗೀತೆ" },
      { slug: "pravasa-kathana", title: "ಪ್ರವಾಸ ಕಥನ" },
      { slug: "kurudu-kanchana", title: "ಕುರುಡು ಕಾಂಚಾಣಾ" },
    ],
  },
};

function Essentials() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);

  useOverlay("essentials", !!selectedUrl);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject((prev) => (prev === subject ? "" : subject));
  };

  const handleAttempt = (subjectSlug, chapterSlug) => {
    setSelectedUrl(`${BASE_URL}/${subjectSlug}/${chapterSlug}`);
  };

  const handleGradeCalculator = () => {
    setSelectedUrl("https://rvce-grade-calculator.vercel.app");
  };

  const handleHolidayList = () => {
    setSelectedUrl(
      "https://drive.google.com/file/d/1c6h_O2zGKccDWviNap-t7_s6budIjJ_2/preview",
    );
  };

  const handleGithubStar = () => {
    window.open("https://github.com/dath2006/RVCE-Utility", "_blank");
  };

  const handleMailDeveloper = () => {
    window.open(
      "mailto:sathishdathds.cs24@rvce.edu.in?subject=Contributing to the site&body=Hi Sathish, I would like to contribute to the site...",
      "_blank",
    );
  };

  const handleContributorGithub = () => {
    window.open("https://github.com/VivaanHooda", "_blank");
  };

  return (
    <div
      className="mx-auto w-full max-w-7xl px-3 pb-24 sm:px-6 lg:px-8"
      style={{ paddingTop: "calc(var(--app-nav-offset, 88px) + 0.5rem)" }}
    >
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute right-4 top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative"
        >
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Essentials Hub
          </Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Essentials
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Quizzes, calculators, academic references, and contribution
            shortcuts in one focused workspace.
          </p>
        </motion.div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <BookOpen className="h-5 w-5" />
              Subject Quizzes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick a subject, then attempt chapter-wise quizzes.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {Object.entries(subjects).map(([subject, data]) => {
                const Icon = data.icon;
                const isActive = selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectSelect(subject)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-background hover:border-primary/40 hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-primary-foreground/20"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold">{subject}</p>
                    </div>
                    <p
                      className={cn(
                        "mt-2 text-xs",
                        isActive
                          ? "text-primary-foreground/85"
                          : "text-muted-foreground",
                      )}
                    >
                      {data.chapters.length} chapters
                    </p>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {selectedSubject && (
                <motion.div
                  key={selectedSubject}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-border/70 bg-background p-4"
                >
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold sm:text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {selectedSubject} Chapters
                  </h2>
                  <div className="space-y-2">
                    {subjects[selectedSubject].chapters.map(
                      (chapter, index) => (
                        <div
                          key={chapter.slug}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              Chapter {index + 1}
                            </p>
                            <p className="text-sm font-medium leading-5 break-words">
                              {chapter.title}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="shrink-0 rounded-full"
                            onClick={() =>
                              handleAttempt(
                                subjects[selectedSubject].slug,
                                chapter.slug,
                              )
                            }
                          >
                            <Play className="h-3.5 w-3.5" />
                            Attempt
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-4 w-4" />
                Grade Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Contributed by Vivaan Hooda.
              </p>
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <button
                  type="button"
                  onClick={handleContributorGithub}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Vivaan Hooda
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={handleGradeCalculator}
              >
                Open Calculator
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                2026 Holiday List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Academic holidays and break windows.
              </p>
              <Button className="w-full rounded-xl" onClick={handleHolidayList}>
                View Holidays
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-4 w-4" />
                Quick Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                More utilities are being added.
              </p>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => window.alert("More tools coming soon!")}
              >
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4 rounded-3xl border-border/70 bg-card/90 shadow-sm">
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Developer
              </p>
              <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                <Code className="h-5 w-5 text-primary" />
                Sathish Dath
              </h3>
              <p className="mt-1 text-sm text-primary">
                Computer Science Engineering
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                If this platform helps you, star the project and feel free to
                contribute with ideas or code.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleGithubStar}
              >
                <Github className="h-4 w-4" />
                <Star className="h-4 w-4" />
                Star Project
              </Button>
              <Button className="rounded-full" onClick={handleMailDeveloper}>
                <Mail className="h-4 w-4" />
                Join Contributors
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Built for speed, clarity, and academic focus.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedUrl && (
          <FileViewer
            url={selectedUrl}
            title="Essentials"
            onClose={() => setSelectedUrl(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Essentials;
