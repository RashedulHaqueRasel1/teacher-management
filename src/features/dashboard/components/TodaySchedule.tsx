import Link from "next/link";
import { ArrowRight, CalendarOff, Clock } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionLabel } from "@/features/classes/demoData/mock-data";
import { minutesToTime } from "@/features/students/demoData/profile-data";
import { cn } from "@/lib/utils";

import type { TodayPeriod } from "../hooks/use-today";

const STATE = {
  done: { label: "Done", tone: "neutral" },
  now: { label: "In class now", tone: "success" },
  next: { label: "Up next", tone: "info" },
  later: { label: "", tone: "neutral" },
} as const;

/** Today's periods in order, with the running and next class highlighted. */
export function TodaySchedule({ periods, off }: { periods: TodayPeriod[]; off: string | null }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Today&apos;s classes</CardTitle>
          <CardDescription>{off ? off : `${periods.length} period${periods.length === 1 ? "" : "s"} on your routine`}</CardDescription>
        </div>
        <Link href="/routine" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          Full routine <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      {periods.length === 0 ? (
        <EmptyState icon={CalendarOff} title={off ? "Day off" : "No classes today"} description={off ? "Enjoy your day — your routine resumes on the next working day." : "You have no periods on today's routine."} />
      ) : (
        <ol className="space-y-2 p-6 pt-4">
          {periods.map((p) => {
            const state = STATE[p.state];
            return (
              <li
                key={`${p.day}-${p.period}`}
                className={cn(
                  "flex items-center gap-4 rounded-xl border px-4 py-3 transition",
                  p.state === "now" ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10" : p.state === "next" ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/30 dark:bg-indigo-500/5" : "border-line",
                  p.state === "done" && "opacity-60",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-soft text-fg">
                  <span className="text-[10px] font-semibold uppercase text-fg-muted">P</span>
                  <span className="-mt-0.5 text-sm font-bold tabular-nums">{p.period}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{p.assignment.subject}</p>
                  <p className="truncate text-xs text-fg-muted">{sectionLabel(p.assignment.className, p.assignment.section)}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-xs font-medium tabular-nums text-fg-secondary">
                    <Clock className="h-3.5 w-3.5 text-fg-subtle" />
                    {minutesToTime(p.start)} – {minutesToTime(p.end)}
                  </p>
                  {state.label && (
                    <Badge tone={state.tone} dot className="mt-1">
                      {state.label}
                    </Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
