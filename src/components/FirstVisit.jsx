import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Compass, MoonStar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SelectionPopup from "./SelectionPopup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOverlay } from "../contexts/NavigationContext";

const highlights = [
  {
    icon: Compass,
    title: "Personalized resource path",
    description:
      "Choose your year, cycle, and basket courses once and get a cleaner resource experience.",
  },
  {
    icon: BookOpen,
    title: "Fast access",
    description:
      "Jump into notes, files, and tools without digging through folders every visit.",
  },
  {
    icon: MoonStar,
    title: "Light and dark ready",
    description:
      "Switch between light and dark themes anytime from the top navigation bar.",
  },
];

function FirstVisit() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useOverlay("firstVisit", true);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-foreground/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl flex-col justify-center"
      >
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.22em]"
              >
                Welcome
              </Badge>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Start with a cleaner setup for the RVCE resource portal.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Pick your academic context once and jump straight into the most
                relevant resources for your semester and courses.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-7"
                onClick={() => setShowPopup(true)}
              >
                Get started
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7"
                onClick={() => navigate("/contributors")}
              >
                Explore community updates
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-[1.5rem] border-border/70 bg-card/80 shadow-sm backdrop-blur-sm"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 inline-flex rounded-2xl bg-secondary p-3 text-secondary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-base font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card/90 shadow-soft backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="border-b border-border/70 px-6 py-5">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Getting started
                </p>
              </div>
              <div className="space-y-6 p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    1. Pick your branch
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Year, cycle, and course filters
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    2. Save your preferences
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Stored locally for future visits
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    3. Enter the resources view
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Straight into the materials that match you
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
                  You can update these preferences later anytime by clearing and
                  re-selecting your filters.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {showPopup && (
        <SelectionPopup
          onClose={() => setShowPopup(false)}
          onSubmit={(selectedFilters) => {
            localStorage.setItem("filters", JSON.stringify(selectedFilters));
            navigate("/resources");
          }}
        />
      )}
    </section>
  );
}

export default FirstVisit;
