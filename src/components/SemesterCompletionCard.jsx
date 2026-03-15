import PropTypes from "prop-types";
import { Award, BarChart3, Download, Sparkles } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function SemesterCompletionCard({
  overallAttendance,
  setActiveComponent,
}) {
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#3b82f6";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Card className="mx-auto max-w-3xl overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader className="border-b border-border/70 bg-[linear-gradient(145deg,rgba(2,6,23,0.98),rgba(30,41,59,0.94))] text-primary-foreground">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full border border-white/10 bg-white/10 p-3 text-white">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/10"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Semester Complete
            </Badge>
            <CardTitle className="text-2xl text-white sm:text-3xl">
              Congratulations
            </CardTitle>
            <CardDescription className="text-slate-300">
              You have reached the end of the semester. Your attendance summary
              is ready.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        {overallAttendance?.pending > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Attendance may still shift because{" "}
            <span className="font-semibold">
              {overallAttendance.pending} classes
            </span>{" "}
            are still pending.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Classes Attended
            </p>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {overallAttendance?.present || 0}/
              {overallAttendance?.totalClasses - overallAttendance?.ignore || 0}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Completed classes across the semester timeline.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Attendance Rate
            </p>
            <div
              className="mt-2 text-3xl font-bold"
              style={{
                color: getAttendanceColor(
                  overallAttendance?.attendancePercent || 0,
                ),
              }}
            >
              {overallAttendance?.attendancePercent || 0}%
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${overallAttendance?.attendancePercent || 0}%`,
                  backgroundColor: getAttendanceColor(
                    overallAttendance?.attendancePercent || 0,
                  ),
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          You finished the semester with{" "}
          <span className="font-semibold text-foreground">
            {overallAttendance?.present || 0} /{" "}
            {overallAttendance?.totalClasses - overallAttendance?.ignore || 0}
          </span>{" "}
          attended classes and an overall attendance of{" "}
          <span
            className="font-semibold"
            style={{
              color: getAttendanceColor(
                overallAttendance?.attendancePercent || 0,
              ),
            }}
          >
            {overallAttendance?.attendancePercent || 0}%
          </span>
          .
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => setActiveComponent("statistics")}
            className="sm:min-w-44"
          >
            <BarChart3 className="h-4 w-4" />
            View Statistics
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveComponent("import")}
            className="sm:min-w-44"
          >
            <Download className="h-4 w-4" />
            Import New Semester
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

SemesterCompletionCard.propTypes = {
  overallAttendance: PropTypes.shape({
    present: PropTypes.number,
    totalClasses: PropTypes.number,
    ignore: PropTypes.number,
    attendancePercent: PropTypes.number,
    pending: PropTypes.number,
  }),
  setActiveComponent: PropTypes.func.isRequired,
};
