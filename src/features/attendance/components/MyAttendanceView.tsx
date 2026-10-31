"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartTooltip, useTooltip } from "@/components/ui/tooltip";
import { formatDate } from "@/features/admissions/utils";
import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { AttendanceCalendar } from "@/features/students/components/profile/AttendanceCalendar";
import { ATTENDANCE_STYLE, MONTHS, formatDuration, inMonth, summarize } from "@/features/students/components/profile/attendance-utils";
import { weeklyOffLabel } from "@/features/students/components/profile/admin/WeekendDialog";
import { localToday, minutesToTime } from "@/features/students/demoData/profile-data";
import { cn } from "@/lib/utils";

const STATUS_TONE = { present: "success", late: "warning", absent: "danger", leave: "violet", holiday: "info", weekend: "neutral" } as const;

/**
 * The teacher's own biometric attendance (read-only). Wrong record? The office
 * corrects it. TODO (backend phase): GET /me/attendance?from=&to=
 */
export function MyAttendanceView() {
  const { teacher, attendance: days, attendanceFrom, shift, corrections, weekend, hydrated } = useCurrentTeacher();
  const [picked, setPicked] = useState<{ month: number; year: number } | null>(null);
  const tip = useTooltip();
  if (!hydrated || !teacher || !days || !shift || !weekend) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  // Read on the client after hydration, never during prerender.
  const today = localToday();
  const month = picked?.month ?? Number(today.slice(5, 7)) - 1;
  const year = picked?.year ?? Number(today.slice(0, 4));
  const isCorrected = (date: string) => Boolean(corrections?.[date]);

  // This academic year only, for the summary.
  const thisYear = days.filter((d) => d.date.startsWith(today.slice(0, 4)));
  const summary = summarize(thisYear);
  const monthLog = inMonth(days, year, month)
    .filter((d) => d.status !== "weekend")
    .reverse();
  const months = Array.from(new Set(thisYear.map((d) => d.date.slice(0, 7)))).map((key) => {
    const [y, m] = key.split("-").map(Number) as [number, number];
    return { key, label: MONTHS[m - 1]!.slice(0, 3), ...summarize(inMonth(days, y, m - 1)) };
  });
  const lateDays = thisYear.filter((d) => d.status === "late").reverse();

  const tiles = [
    { label: `Attendance ${today.slice(0, 4)}`, value: `${summary.rate}%`, className: "text-indigo-600" },
    { label: "Working days", value: summary.schoolDays },
    { label: "Present", value: summary.present, className: "text-emerald-600" },
    { label: "Late", value: summary.late, className: "text-amber-600" },
    { label: "Leave", value: summary.leave, className: "text-violet-600" },
    { label: "Absent", value: summary.absent, className: "text-rose-600" },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="My Attendance"
        description={`Staff biometric records · ${shift.name} shift ${minutesToTime(shift.start)} – ${minutesToTime(shift.end)} · weekly off: ${weeklyOffLabel(weekend)}. If a record is wrong, ask the office to correct it.`}
      />

      <Card className="grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
        {tiles.map((t) => (
          <div key={t.label} className="px-5 py-4">
            <p className="text-xs font-medium text-fg-muted">{t.label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums text-fg", t.className)}>{t.value}</p>
          </div>
        ))}
      </Card>

      <AttendanceCalendar
        days={days}
        shift={shift}
        enrolledOn={attendanceFrom!}
        month={month}
        year={year}
        onChange={(m, y) => {
          setPicked({ month: m, year: y });
        }}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Month by month</h2>
          <p className="mt-0.5 text-xs text-fg-muted">Share of working days per status. Hover a bar for details, click to open the month above.</p>
          <div className="group/chart mt-6 flex h-56 items-end gap-2 sm:gap-3">
            {months.map((m) => {
              const segments = [
                { value: m.present, className: "bg-emerald-500" },
                { value: m.late, className: "bg-amber-400" },
                { value: m.leave, className: "bg-violet-500" },
                { value: m.absent, className: "bg-rose-500" },
              ];
              const active = m.key === `${year}-${String(month + 1).padStart(2, "0")}`;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setPicked({ year: Number(m.key.slice(0, 4)), month: Number(m.key.slice(5, 7)) - 1 });
                  }}
                  aria-label={`${MONTHS[Number(m.key.slice(5, 7)) - 1]}: ${m.rate}% attendance`}
                  {...tip.trigger(
                    <ChartTooltip
                      title={`${MONTHS[Number(m.key.slice(5, 7)) - 1]} ${m.key.slice(0, 4)}`}
                      subtitle={m.schoolDays ? `${m.rate}% attendance · ${m.schoolDays} working days` : "No working days yet"}
                      rows={[
                        { label: "Present", value: m.present, color: "bg-emerald-500" },
                        { label: "Late", value: m.late, color: "bg-amber-400" },
                        { label: "Leave", value: m.leave, color: "bg-violet-500" },
                        { label: "Absent", value: m.absent, color: "bg-rose-500" },
                      ]}
                      footer={active ? "Showing in the calendar" : "Click to open in the calendar"}
                    />,
                  )}
                  className="group/bar flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2 rounded-lg transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 group-hover/chart:opacity-45 hover:opacity-100!"
                >
                  <span className="text-[11px] font-semibold tabular-nums text-fg-muted">{m.schoolDays ? `${Math.round(m.rate)}%` : "—"}</span>
                  <span className={cn("flex w-full max-w-10 flex-1 flex-col-reverse overflow-hidden rounded-lg bg-soft transition-transform duration-200 group-hover/bar:scale-x-110", active && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-surface")}>
                    {segments.map((seg, i) => (
                      <span key={i} className={cn(seg.className, "transition-[height] duration-500")} style={{ height: `${m.schoolDays ? (seg.value / m.schoolDays) * 100 : 0}%` }} />
                    ))}
                  </span>
                  <span className={cn("text-xs font-medium", active ? "text-indigo-600" : "text-fg-muted")}>{m.label}</span>
                </button>
              );
            })}
          </div>
          {tip.node}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Late arrivals</h2>
          <p className="mt-0.5 text-xs text-fg-muted">{lateDays.length} day(s) this year</p>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {lateDays.map((d) => (
              <li key={d.date} className="flex items-center justify-between gap-3 rounded-xl bg-subtle px-3 py-2.5">
                <p className="text-sm font-medium text-fg">{formatDate(d.date)}</p>
                <span className="text-xs tabular-nums text-amber-600">{d.checkIn}</span>
              </li>
            ))}
            {lateDays.length === 0 && <li className="py-6 text-center text-sm text-fg-muted">Always on time 🎉</li>}
          </ul>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">
            Daily log · {MONTHS[month]} {year}
          </h2>
          <p className="mt-0.5 text-xs text-fg-muted">Check-in and check-out from the staff biometric device.</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] whitespace-nowrap text-sm">
            <thead>
              <tr className="border-y border-line bg-subtle/70 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                <th className="py-3 pl-5 pr-3 sm:pl-6">Date</th>
                <th className="px-3 py-3">Day</th>
                <th className="px-3 py-3">Check-in</th>
                <th className="px-3 py-3">Check-out</th>
                <th className="px-3 py-3">Hours</th>
                <th className="py-3 pl-3 pr-5 sm:pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {monthLog.map((d) => (
                <tr key={d.date}>
                  <td className="py-3 pl-5 pr-3 font-medium text-fg sm:pl-6">{formatDate(d.date)}</td>
                  <td className="px-3 py-3 text-fg-muted">{new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}</td>
                  <td className="px-3 py-3 tabular-nums text-fg-secondary">{d.checkIn ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums text-fg-secondary">{d.checkOut ?? (d.checkIn ? "On campus" : "—")}</td>
                  <td className="px-3 py-3 tabular-nums text-fg-secondary">{d.minutes ? formatDuration(d.minutes) : "—"}</td>
                  <td className="py-3 pl-3 pr-5 sm:pr-6">
                    <div className="flex items-center gap-1.5">
                      <Badge tone={STATUS_TONE[d.status]} dot>
                        {d.status === "holiday" || d.status === "leave" ? (d.note ?? ATTENDANCE_STYLE[d.status].label) : ATTENDANCE_STYLE[d.status].label}
                      </Badge>
                      {isCorrected(d.date) && <Badge tone="info">Edited</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
              {monthLog.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-fg-muted">
                    No records for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
