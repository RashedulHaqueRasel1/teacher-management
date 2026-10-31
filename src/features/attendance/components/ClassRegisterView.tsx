"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, CheckCheck, Clock, Crown, HeartPulse, Sun, XCircle, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import { formatDate } from "@/features/admissions/utils";
import { useMyClasses } from "@/features/classes/hooks/use-my-classes";
import { ATTENDANCE_STYLE, adminMark } from "@/features/students/components/profile/attendance-utils";
import { SHIFTS, addDaysIso, localToday } from "@/features/students/demoData/profile-data";
import { useStudentProfiles } from "@/features/students/hooks/use-student-profiles";
import { useStudentAdminStore } from "@/features/students/store/student-admin.store";
import type { AttendanceStatus, Shift, Student } from "@/features/students/types/types";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/store/confirm.store";
import { toast } from "@/store/toast.store";

/** Class teachers can correct the register for the last week; older changes go through the office. */
export const EDIT_WINDOW_DAYS = 7;

const QUICK: { status: AttendanceStatus; label: string; icon: LucideIcon; on: string }[] = [
  { status: "present", label: "P", icon: Sun, on: "bg-emerald-500 text-white" },
  { status: "late", label: "L", icon: Clock, on: "bg-amber-500 text-white" },
  { status: "absent", label: "A", icon: XCircle, on: "bg-rose-500 text-white" },
  { status: "leave", label: "Lv", icon: HeartPulse, on: "bg-violet-500 text-white" },
];

const TONE = { present: "success", late: "warning", absent: "danger", leave: "violet", holiday: "info", weekend: "neutral" } as const;

/** Same record the office would write, noted as the class teacher's mark. */
const teacherMark = (status: AttendanceStatus, shift: Shift, date: string) => ({ ...adminMark(status, shift, date), note: `${ATTENDANCE_STYLE[status].label} (marked by class teacher)` });

/**
 * Daily attendance register for the teacher's class-teacher sections.
 * BACKEND: PUT /sections/:id/attendance/:date  [{ studentId, status }] — only the
 * section's class teacher, within EDIT_WINDOW_DAYS.
 */
export function ClassRegisterView() {
  const { classTeacherSections, teacher, hydrated } = useMyClasses();
  const { profiles, hydrated: profilesReady } = useStudentProfiles();
  const setAttendance = useStudentAdminStore((s) => s.setAttendance);
  const corrections = useStudentAdminStore((s) => s.attendance);
  const requested = useSearchParams().get("section");
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedDate, setDate] = useState<string | null>(null);

  if (!hydrated || !profilesReady || !teacher) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  // Read on the client after hydration, never during prerender.
  const today = localToday();
  const date = pickedDate ?? today;

  const section = classTeacherSections.find((s) => s.slug === (picked ?? requested)) ?? classTeacherSections[0];
  const header = <PageHeader title="Attendance Register" description="Take or correct the daily attendance of your class. Gate-scanner records are filled in automatically." />;

  if (!section) {
    return (
      <div className="animate-fade-up">
        {header}
        <Card>
          <EmptyState icon={CalendarCheck} title="You are not a class teacher" description="Only a section's class teacher keeps its register. Your subject classes are listed under My Classes." />
        </Card>
      </div>
    );
  }

  const minDate = addDaysIso(today, -EDIT_WINDOW_DAYS);
  const shift = SHIFTS[section.settings.shift] ?? SHIFTS.Morning!;
  const rows = section.students.flatMap((student) => {
    const p = profiles.get(student.id);
    return p ? [{ student, day: p.profile.attendance.find((d) => d.date === date) }] : [];
  });
  const off = (r: (typeof rows)[number]) => r.day?.status === "weekend" || r.day?.status === "holiday";
  const counts = { present: 0, late: 0, absent: 0, leave: 0, unmarked: 0 };
  for (const r of rows) {
    if (off(r)) continue;
    if (!r.day) counts.unmarked += 1;
    else if (r.day.status in counts) counts[r.day.status as keyof typeof counts] += 1;
  }
  const allOff = rows.length > 0 && rows.every(off);

  const save = (student: Student, status: AttendanceStatus) =>
    setAttendance(student.id, date, teacherMark(status, shift, date), `${formatDate(date)} → ${ATTENDANCE_STYLE[status].label} (class teacher register)`, teacher.name);

  async function mark(student: Student, status: AttendanceStatus) {
    const ok = await confirmAction({
      title: `Mark ${ATTENDANCE_STYLE[status].label.toLowerCase()}?`,
      description: `${student.name} · ${formatDate(date)}. Saved on the student's attendance under your name.`,
      confirmLabel: `Mark ${ATTENDANCE_STYLE[status].label.toLowerCase()}`,
      tone: status === "absent" ? "danger" : "primary",
      rememberKey: `register:${section!.key}`,
    });
    if (ok) save(student, status);
  }

  async function markRestPresent() {
    const targets = rows.filter((r) => !off(r) && !r.day);
    const ok = await confirmAction({ title: "Mark the rest present?", description: `${targets.length} unmarked student(s) · ${formatDate(date)}.`, confirmLabel: "Mark present" });
    if (!ok) return;
    for (const r of targets) save(r.student, "present");
    toast("Marked present", { description: `${targets.length} student(s) · ${formatDate(date)}` });
  }

  return (
    <div className="animate-fade-up space-y-6">
      {header}

      <Card className="flex flex-col gap-4 p-4 sm:px-5 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap gap-2">
          {classTeacherSections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setPicked(s.slug)}
              aria-pressed={s.key === section.key}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                s.key === section.key ? "border-indigo-500 bg-linear-to-b from-indigo-500 to-indigo-600 text-white shadow-glow" : "border-line text-fg-secondary hover:bg-soft hover:text-fg",
              )}
            >
              <Crown className="h-3.5 w-3.5" />
              {s.className} · {s.section}
              <span className={cn("rounded-md px-1.5 text-[11px] tabular-nums", s.key === section.key ? "bg-white/25" : "bg-soft")}>{s.students.length}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={date} min={minDate} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-44" aria-label="Date" />
          <Button onClick={markRestPresent} disabled={counts.unmarked === 0 || allOff}>
            <CheckCheck className="h-4 w-4" />
            Mark rest present{counts.unmarked ? ` (${counts.unmarked})` : ""}
          </Button>
        </div>
      </Card>

      <Card className="grid grid-cols-2 divide-line sm:grid-cols-5 sm:divide-x">
        {(
          [
            ["Present", counts.present, "text-emerald-600"],
            ["Late", counts.late, "text-amber-600"],
            ["Absent", counts.absent, "text-rose-600"],
            ["Leave", counts.leave, "text-violet-600"],
            ["Not marked", counts.unmarked, "text-fg-muted"],
          ] as const
        ).map(([label, value, cls]) => (
          <div key={label} className="px-5 py-4">
            <p className="text-xs font-medium text-fg-muted">{label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", cls)}>{value}</p>
          </div>
        ))}
      </Card>

      {allOff ? (
        <Card className="py-12 text-center text-sm text-fg-muted">
          {formatDate(date)} is a day off for this section ({rows[0]?.day?.note ?? "weekend"}).
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {rows.map((r) => {
            const edited = Boolean(corrections[r.student.id]?.[date]);
            return (
              <div key={r.student.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-fg-subtle">{r.student.roll}</span>
                  <StudentAvatar name={r.student.name} photo={r.student.photo} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{r.student.name}</p>
                    <p className="text-xs text-fg-muted">{r.day?.checkIn ? `In ${r.day.checkIn}${r.day.checkOut ? ` · out ${r.day.checkOut}` : ""}` : (r.day?.note ?? "No record")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.day && (
                    <Badge tone={TONE[r.day.status]} dot>
                      {ATTENDANCE_STYLE[r.day.status].label}
                    </Badge>
                  )}
                  {edited && <Badge tone="info">Edited</Badge>}
                  {off(r) ? (
                    <span className="text-xs text-fg-subtle">Day off</span>
                  ) : (
                    <div className="flex rounded-xl bg-soft p-1">
                      {QUICK.map((q) => (
                        <button
                          key={q.status}
                          type="button"
                          onClick={() => mark(r.student, q.status)}
                          aria-pressed={r.day?.status === q.status}
                          title={ATTENDANCE_STYLE[q.status].label}
                          className={cn("h-8 min-w-9 rounded-lg px-2 text-xs font-bold transition", r.day?.status === q.status ? q.on : "text-fg-muted hover:bg-surface hover:text-fg")}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {rows.length === 0 && <p className="py-10 text-center text-sm text-fg-muted">No students in this section.</p>}
        </Card>
      )}
    </div>
  );
}
