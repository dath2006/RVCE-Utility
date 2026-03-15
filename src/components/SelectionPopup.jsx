/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CircleHelp,
  GraduationCap,
  Layers3,
} from "lucide-react";

import searchFiles from "../hooks/searchFiles";
import WaveLoader from "./Loading";
import FileViewer from "./FileViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useOverlay } from "../contexts/NavigationContext";

function ChoiceCard({ title, description, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-[1.35rem] border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-card hover:border-foreground/30 hover:bg-accent/60",
        disabled &&
          "cursor-not-allowed opacity-45 hover:border-border hover:bg-card",
      )}
    >
      <p className="font-medium">{title}</p>
      {description && (
        <p
          className={cn(
            "mt-2 text-sm",
            selected ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </button>
  );
}

function CourseSelect({ label, value, onValueChange, options, onHelp }) {
  return (
    <Card className="rounded-[1.35rem] border-border/70 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{label}</p>
          <Button type="button" variant="ghost" size="icon" onClick={onHelp}>
            <CircleHelp className="h-4 w-4" />
          </Button>
        </div>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function SelectionPopup({ onClose, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState({
    year: "",
    cycle: "",
    selectedESC: "",
    selectedPLC: "",
    selectedETC: "",
    selectedKannada: "",
    selectedSem3: "",
    selectedSem4: "",
  });
  const [escCourses, setEscCourses] = useState([]);
  const [plcCourses, setPlcCourses] = useState([]);
  const [etcCourses, setEtcCourses] = useState([]);
  const [kannadaCourses, setKannadaCourses] = useState([]);
  const [sem3Courses, setSem3Courses] = useState([]);
  const [sem4Courses, setSem4Courses] = useState([]);
  const [showHelp, setShowHelp] = useState([false, ""]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isHelpOpen = showHelp[0];

  useOverlay("selectionHelpViewer", isHelpOpen);

  useEffect(() => {
    async function getFiles() {
      setLoading(true);

      try {
        const response = await axios.get(import.meta.env.VITE_FILES_URL);
        const data = response.data;

        handleSelect(data);
        setJsonData(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    }

    getFiles();
  }, []);

  useEffect(() => {
    if (selection.cycle === "3-Sem-ECE" && selection.selectedSem3 !== "N/A") {
      setSelection((prev) => ({ ...prev, selectedSem3: "N/A" }));
    }
  }, [selection.cycle, selection.selectedSem3]);

  const handleSelect = (data) => {
    if (!data?.length) {
      return;
    }

    const firstYear = data.find((item) => item.name === "1 Year");
    const secondYear = data.find((item) => item.name === "2 Year");

    if (secondYear) {
      const sem3 = secondYear.children.find(
        (item) => item.name === "3-Sem-CSE" || item.name === "3-Sem-ECE",
      );

      if (sem3) {
        const basket = sem3.children.find(
          (item) => item.name === "Basket course",
        );
        const basketCourses = basket
          ? basket.children.map((course) => course.name)
          : [];

        setSem3Courses(basketCourses);
        setSem4Courses(basketCourses);
      }
    }

    if (firstYear) {
      const cCycle = firstYear.children.find(
        (item) => item.name === "C - Cycle",
      );
      const pCycle = firstYear.children.find(
        (item) => item.name === "P - Cycle",
      );

      if (cCycle) {
        const esc = cCycle.children.find((item) => item.name === "ESC");
        const plc = cCycle.children.find(
          (item) => item.name === "PLC (22PL15X)",
        );
        setEscCourses(esc ? esc.children.map((course) => course.name) : []);
        setPlcCourses(plc ? plc.children.map((course) => course.name) : []);
      }

      if (pCycle) {
        const etc = pCycle.children.find(
          (item) => item.name === "ETC (22EM2XX)",
        );
        const kannada = pCycle.children.find(
          (item) => item.name === "Kannada (22HSXK17)",
        );
        const esc = cCycle?.children.find((item) => item.name === "ESC");

        setEscCourses(esc ? esc.children.map((course) => course.name) : []);
        setEtcCourses(etc ? etc.children.map((course) => course.name) : []);
        setKannadaCourses(
          kannada ? kannada.children.map((course) => course.name) : [],
        );
      }
    }
  };

  const getContent = (text) => {
    const results = searchFiles(`_which ${text} to choose.txt`, jsonData);
    return results && results[0]?.webViewLink;
  };

  const filtered = (list) => list.filter((course) => !course.includes(".txt"));

  const steps = useMemo(
    () => [
      {
        title: "Choose your year",
        description: "Pick your current academic year.",
      },
      {
        title: "Choose your semester or cycle",
        description: "Select your cycle/semester.",
      },
      {
        title: "Choose your course filters",
        description: "Set required course filters.",
      },
    ],
    [],
  );

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return selection.year !== "";
      case 1:
        return selection.cycle !== "";
      case 2:
        if (selection.cycle === "C - Cycle") {
          return Boolean(selection.selectedESC && selection.selectedPLC);
        }
        if (selection.cycle === "P - Cycle") {
          return Boolean(
            selection.selectedETC &&
            selection.selectedKannada &&
            selection.selectedESC,
          );
        }
        if (selection.cycle === "3-Sem-CSE") {
          return Boolean(selection.selectedSem3);
        }
        if (selection.cycle === "3-Sem-ECE") {
          return true;
        }
        if (selection.cycle === "4-Sem-CSE") {
          return Boolean(selection.selectedSem4);
        }
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    onSubmit(selection);
    onClose();
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            title="1st Year"
            description="C Cycle / P Cycle"
            selected={selection.year === "1 Year"}
            onClick={() =>
              setSelection((prev) => ({ ...prev, year: "1 Year", cycle: "" }))
            }
          />
          <ChoiceCard
            title="2nd Year"
            description="3rd / 4th semester"
            selected={selection.year === "2 Year"}
            onClick={() =>
              setSelection((prev) => ({ ...prev, year: "2 Year", cycle: "" }))
            }
          />
          <ChoiceCard
            title="3rd Year"
            description="Not available yet"
            disabled
          />
          <ChoiceCard
            title="4th Year"
            description="Not available yet"
            disabled
          />
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {selection.year === "1 Year" && (
            <>
              <ChoiceCard
                title="C Cycle"
                description="ESC + PLC"
                selected={selection.cycle === "C - Cycle"}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, cycle: "C - Cycle" }))
                }
              />
              <ChoiceCard
                title="P Cycle"
                description="ETC + ESC + Kannada"
                selected={selection.cycle === "P - Cycle"}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, cycle: "P - Cycle" }))
                }
              />
            </>
          )}
          {selection.year === "2 Year" && (
            <>
              <ChoiceCard
                title="3rd Sem CSE"
                description="Basket course required"
                selected={selection.cycle === "3-Sem-CSE"}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, cycle: "3-Sem-CSE" }))
                }
              />
              <ChoiceCard
                title="3rd Sem ECE"
                description="No extra selection"
                selected={selection.cycle === "3-Sem-ECE"}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, cycle: "3-Sem-ECE" }))
                }
              />
              <ChoiceCard
                title="4th Sem CSE"
                description="Basket course required"
                selected={selection.cycle === "4-Sem-CSE"}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, cycle: "4-Sem-CSE" }))
                }
              />
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {selection.cycle === "C - Cycle" && (
          <>
            <CourseSelect
              label="ESC course"
              value={selection.selectedESC}
              onValueChange={(value) =>
                setSelection((prev) => ({ ...prev, selectedESC: value }))
              }
              options={filtered(escCourses)}
              onHelp={() => setShowHelp([true, getContent("esc")])}
            />
            <CourseSelect
              label="PLC course"
              value={selection.selectedPLC}
              onValueChange={(value) =>
                setSelection((prev) => ({ ...prev, selectedPLC: value }))
              }
              options={filtered(plcCourses)}
              onHelp={() => setShowHelp([true, getContent("plc")])}
            />
          </>
        )}

        {selection.cycle === "P - Cycle" && (
          <>
            <CourseSelect
              label="ETC course"
              value={selection.selectedETC}
              onValueChange={(value) =>
                setSelection((prev) => ({ ...prev, selectedETC: value }))
              }
              options={filtered(etcCourses)}
              onHelp={() => setShowHelp([true, getContent("etc")])}
            />
            <CourseSelect
              label="ESC course"
              value={selection.selectedESC}
              onValueChange={(value) =>
                setSelection((prev) => ({ ...prev, selectedESC: value }))
              }
              options={filtered(escCourses)}
              onHelp={() => setShowHelp([true, getContent("esc")])}
            />
            <CourseSelect
              label="Kannada course"
              value={selection.selectedKannada}
              onValueChange={(value) =>
                setSelection((prev) => ({ ...prev, selectedKannada: value }))
              }
              options={filtered(kannadaCourses)}
              onHelp={() => setShowHelp([true, "You Know Na Dude! 😁"])}
            />
          </>
        )}

        {selection.cycle === "3-Sem-CSE" && (
          <CourseSelect
            label="Basket course"
            value={selection.selectedSem3}
            onValueChange={(value) =>
              setSelection((prev) => ({ ...prev, selectedSem3: value }))
            }
            options={filtered(sem3Courses)}
            onHelp={() => setShowHelp([true, getContent("basket")])}
          />
        )}

        {selection.cycle === "4-Sem-CSE" && (
          <CourseSelect
            label="Basket course"
            value={selection.selectedSem4}
            onValueChange={(value) =>
              setSelection((prev) => ({ ...prev, selectedSem4: value }))
            }
            options={filtered(sem4Courses)}
            onHelp={() => setShowHelp([true, getContent("basket")])}
          />
        )}

        {selection.cycle === "3-Sem-ECE" && (
          <Card className="rounded-[1.35rem] border-border/70 bg-muted/40 shadow-none">
            <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
              No extra course filter is needed for 3rd sem ECE.
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/85 backdrop-blur-sm">
        <WaveLoader
          size="7em"
          primaryColor="hsl(220,90%,50%)"
          secondaryColor="hsl(300,90%,50%)"
        />
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={!isHelpOpen}
        onOpenChange={(open) => {
          if (!open && !isHelpOpen) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-[2rem] border-border/70 p-0 sm:max-h-[88vh]">
          <div className="grid max-h-[90vh] overflow-hidden lg:grid-cols-[0.78fr_1.22fr]">
            <div className="hidden border-r border-border/70 bg-muted/40 p-6 lg:block">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 uppercase tracking-[0.2em]"
              >
                Onboarding
              </Badge>
              <div className="mt-6 space-y-5">
                {steps.map((step, index) => {
                  const Icon = [GraduationCap, Layers3, BookOpenCheck][index];

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-[1.35rem] border p-4 text-left transition-colors",
                        index === currentStep
                          ? "border-primary bg-background shadow-sm"
                          : "border-border/60 bg-background/60 hover:bg-background",
                      )}
                    >
                      <span className="mt-0.5 rounded-2xl bg-secondary p-3">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm text-muted-foreground">
                          Step {index + 1}
                        </span>
                        <span className="mt-1 block font-medium">
                          {step.title}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {step.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex max-h-[90vh] flex-col overflow-hidden">
              <DialogHeader className="space-y-3 border-b border-border/70 px-6 py-5 text-left">
                <Badge
                  variant="outline"
                  className="w-fit rounded-full px-3 py-1"
                >
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <DialogTitle className="text-2xl">
                  {steps[currentStep].title}
                </DialogTitle>
                <DialogDescription className="max-w-xl leading-6">
                  {steps[currentStep].description}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3 px-6 py-5">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        index === currentStep
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-border",
                      )}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
                <Button onClick={handleNext} disabled={!isStepComplete()}>
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showHelp[0] && (
        <FileViewer
          key={showHelp[1]}
          url={showHelp[1]}
          onClose={() => setShowHelp([false, ""])}
        />
      )}
    </>
  );
}

export default SelectionPopup;
