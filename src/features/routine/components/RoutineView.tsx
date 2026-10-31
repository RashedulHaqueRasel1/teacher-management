"use client";

import { Coffee, Printer } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { sectionCode } from "@/features/classes/demoData/mock-data";
import { localToday, weekdayOf } from "@/features/students/demoData/profile-data";
import { weeklyOffLabel } from "@/features/students/components/profile/admin/WeekendDialog";
import { DAY_NAMES, MAX_PERIODS_PER_WEEK, PERIODS_PER_DAY, ROUTINE_DAYS, periodTime } from "@/features/teachers/demoData/mock-data";
import { cn } from "@/lib/utils";

const SUBJECT_TONES = [
  "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  "bg-amber-50 text-amber-700 ring-amber-200/70",
  "bg-violet-50 text-violet-700 ring-violet-200/70",
  "bg-sky-50 text-sky-700 ring-sky-200/70",
  "bg-rose-50 text-rose-700 ring-rose-200/70",
];

/**
 * The teacher's weekly timetable (days × periods). Read-only — the routine is
 * set by the school office. TODO (backend phase): GET /me/routine
 */
export function RoutineView() {
  const { teacher, routine = [], assignments = [], weekend, hydrated } = useCurrentTeacher();
  if (!hydrated || !teacher || !weekend) return <div className="h-[520px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;

  const days = ROUTINE_DAYS.filter((d) => !weekend.days.includes(d));
  const todayDay = weekdayOf(localToday());
  const toneOf = (id: string) => SUBJECT_TONES[Math.max(0, assignments.findIndex((a) => a.id === id)) % SUBJECT_TONES.length]!;
  const periods = Array.from({ length: PERIODS_PER_DAY }, (_, i) => i + 1);
  const total = routine.length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Class Routine"
        description={`${total} periods a week (max ${MAX_PERIODS_PER_WEEK}) · ${teacher.shift} shift · weekly off: ${weeklyOffLabel(weekend)}. Contact the office for routine changes.`}
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-subtle/70 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                <th className="w-32 border-b border-line px-4 py-3 text-left">Day</th>
                {periods.map((p) => (
                  <th key={p} className="border-b border-l border-line px-3 py-3 text-left">
                    <span className="block text-fg">Period {p}</span>
                    <span className="block font-medium normal-case tracking-normal text-fg-subtle">{periodTime(teacher.shift, p)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const isToday = day === todayDay;
                return (
                  <tr key={day} className={cn(isToday && "bg-indigo-50/40 dark:bg-indigo-500/5")}>
                    <th className="border-b border-line px-4 py-3 text-left">
                      <span className="font-semibold text-fg">{DAY_NAMES[day]}</span>
                      {isToday && <span className="ml-2 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Today</span>}
                    </th>
                    {periods.map((p) => {
                      const slot = routine.find((r) => r.day === day && r.period === p);
                      return (
                        <td key={p} className="h-20 border-b border-l border-line p-1.5 align-top">
                          {slot ? (
                            <div className={cn("h-full rounded-xl px-2.5 py-2 ring-1 ring-inset", toneOf(slot.assignment.id))}>
                              <p className="truncate text-xs font-bold">{slot.assignment.subject}</p>
                              <p className="mt-0.5 truncate text-[11px] font-medium opacity-80">
                                {slot.assignment.className} · {slot.assignment.section}
                              </p>
                              <p className="mt-1 inline-block rounded-md bg-white/60 px-1.5 text-[10px] font-bold dark:bg-black/20">{sectionCode(slot.assignment.className, slot.assignment.section)}</p>
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center rounded-xl text-fg-subtle/60">
                              <Coffee className="h-4 w-4" aria-label="Free period" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assignments.map((a) => {
          const placed = routine.filter((r) => r.assignment.id === a.id).length;
          return (
            <Card key={a.id} className="flex items-center gap-3 p-4">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-inset", toneOf(a.id))}>{sectionCode(a.className, a.section)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{a.subject}</p>
                <p className="text-xs text-fg-muted">
                  {a.className} · Section {a.section}
                </p>
              </div>
              <span className="text-xs font-semibold tabular-nums text-fg-secondary">
                {placed}/{a.periodsPerWeek} per week
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
