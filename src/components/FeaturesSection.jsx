import { useEffect, useState } from "react";
import {
  ChartColumn,
  Files,
  FolderHeart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSwipeable } from "react-swipeable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Smart filters",
    description: "Set once and browse only relevant files.",
    icon: ShieldCheck,
    accent: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    title: "File preview",
    description: "Read notes before downloading.",
    icon: Files,
    accent: "from-blue-500/20 to-indigo-500/20",
  },
  {
    title: "Attendance",
    description: "Check your class status quickly.",
    icon: ChartColumn,
    accent: "from-orange-500/20 to-rose-500/20",
  },
  {
    title: "Contribute",
    description: "Upload notes and improve the library.",
    icon: NotebookPen,
    accent: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    title: "Workspace",
    description: "Keep frequently used material close.",
    icon: FolderHeart,
    accent: "from-pink-500/20 to-red-500/20",
  },
  {
    title: "Unified utility",
    description: "Resources, tools, and community in one place.",
    icon: Sparkles,
    accent: "from-amber-500/20 to-yellow-500/20",
  },
];

function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveIndex((prev) => (prev + 1) % features.length),
    onSwipedRight: () =>
      setActiveIndex((prev) => (prev - 1 + features.length) % features.length),
    trackTouch: true,
    trackMouse: false,
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const activeFeature = features[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section>
      <Card className="relative overflow-hidden rounded-[2rem] border-border/70 bg-card/90 shadow-soft backdrop-blur-xl">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <CardHeader className="space-y-3 border-b border-border/70 p-6 sm:p-8">
          <Badge
            variant="secondary"
            className="w-fit rounded-full px-3 py-1 uppercase tracking-[0.2em]"
          >
            Feature map
          </Badge>
          <CardTitle className="text-2xl">What you can do here</CardTitle>
          <CardDescription className="leading-6">
            Swipe to explore.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <div
            {...handlers}
            className={cn(
              "rounded-[1.5rem] border border-border/70 bg-gradient-to-br p-5 sm:p-6",
              activeFeature.accent,
            )}
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex rounded-2xl bg-secondary p-3">
                <ActiveIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {activeFeature.title}
                </h3>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                  {activeFeature.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <Button
                key={feature.title}
                type="button"
                size="sm"
                variant={index === activeIndex ? "default" : "outline"}
                className="rounded-full px-4"
                onClick={() => setActiveIndex(index)}
              >
                {feature.title}
              </Button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                type="button"
                aria-label={`Select ${feature.title}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-border",
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default FeaturesSection;
