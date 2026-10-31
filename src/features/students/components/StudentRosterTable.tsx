"use client";

import { Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import { cn } from "@/lib/utils";

import { localToday } from "../demoData/profile-data";
import type { AttendanceStatus, Student, StudentProfile } from "../types/types";
import { summarize } from "./profile/attendance-utils";
import { gradeTone } from "./profile/grade-utils";

export type RosterRow = { student: Student; profile: StudentProfile };

const TODAY: Record<AttendanceStatus, { label: string; tone: "success" | "warning" | "danger" | "violet" | "info" | "neutral" }> = {
  present: { label: "Present", tone: "success" },
  late: { label: "Late", tone: "warning" },
  absent: { label: "Absent", tone: "danger" },
  leave: { label: "Leave", tone: "violet" },
  holiday: { label: "Holiday", tone: "info" },
  weekend: { label: "Weekend", tone: "neutral" },
};

/** Read-only student list with today's status, attendance rate and latest GPA. */
export function StudentRosterTable({ rows, showClass, onOpen }: { rows: RosterRow[]; showClass?: boolean; onOpen: (row: RosterRow) => void }) {
  const today = localToday();
  const year = today.slice(0, 4);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] whitespace-nowrap text-sm">
        <thead>
          <tr className="border-y border-line bg-subtle/70 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            <th className="w-14 py-3 pl-5 pr-3 sm:pl-6">Roll</th>
            <th className="px-3 py-3">Student</th>
            {showClass && <th className="px-3 py-3">Class</th>}
            <th className="px-3 py-3">Guardian</th>
            <th className="px-3 py-3">Today</th>
            <th className="px-3 py-3 text-right">Attendance</th>
            <th className="py-3 pl-3 pr-5 text-right sm:pr-6">Latest result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const { student, profile } = row;
            const day = profile.attendance.find((d) => d.date === today);
            const rate = summarize(profile.attendance.filter((d) => d.date.startsWith(year))).rate;
            const latest = profile.exams.filter((e) => e.status === "published").at(-1);
            return (
              <tr key={student.id} onClick={() => onOpen(row)} className="cursor-pointer transition hover:bg-subtle/60">
                <td className="py-3 pl-5 pr-3 font-bold tabular-nums text-fg-subtle sm:pl-6">{student.roll}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.name} photo={student.photo} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-fg">{student.name}</p>
                      <p className="font-mono text-[11px] text-fg-muted">{student.id}</p>
                    </div>
                  </div>
                </td>
                {showClass && (
                  <td className="px-3 py-3 text-fg-secondary">
                    {student.className} · {student.section}
                  </td>
                )}
                <td className="px-3 py-3">
                  <p className="text-fg-secondary">{student.guardianName}</p>
                  {student.phone && (
                    <a href={`tel:${student.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-indigo-600">
                      <Phone className="h-3 w-3" />
                      {student.phone}
                    </a>
                  )}
                </td>
                <td className="px-3 py-3">
                  {day ? (
                    <Badge tone={TODAY[day.status].tone} dot>
                      {TODAY[day.status].label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-fg-subtle">Not marked</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={cn("font-semibold tabular-nums", rate >= 90 ? "text-emerald-600" : rate >= 75 ? "text-amber-600" : "text-rose-600")}>{rate}%</span>
                </td>
                <td className="py-3 pl-3 pr-5 text-right sm:pr-6">
                  {latest ? (
                    <Badge tone={gradeTone(latest.grade)}>
                      {latest.grade} · {latest.gpa.toFixed(2)}
                    </Badge>
                  ) : (
                    <span className="text-xs text-fg-subtle">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
