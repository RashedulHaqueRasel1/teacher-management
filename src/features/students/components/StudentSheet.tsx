"use client";

import { Mail, Phone } from "lucide-react";

import { InfoFields } from "@/components/shared/InfoCard";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import { ageFrom, formatDate } from "@/features/admissions/utils";
import { cn } from "@/lib/utils";

import type { Student, StudentProfile } from "../types/types";
import { summarize } from "./profile/attendance-utils";
import { gradeTone } from "./profile/grade-utils";

/**
 * Read-only student card for teachers: contact, guardians, attendance and
 * published results. (Edits stay with the school office.)
 */
export function StudentSheet({ student, profile, onClose }: { student: Student; profile: StudentProfile; onClose: () => void }) {
  const year = profile.attendance.filter((d) => d.date.startsWith(new Date().getFullYear().toString()));
  const a = summarize(year);
  const results = profile.exams.filter((e) => e.status === "published");

  return (
    <Sheet
      open
      onClose={onClose}
      title={student.name}
      header={
        <div className="flex items-center gap-3">
          <StudentAvatar name={student.name} photo={student.photo} size="lg" />
          <div className="min-w-0 text-sm text-fg-muted">
            <h2 className="truncate text-lg font-semibold text-fg">{student.name}</h2>
            <p>
              {student.className} · Section {student.section} · Roll {student.roll}
            </p>
            <p className="font-mono text-xs">{student.id}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">Student</h3>
          <InfoFields
            items={[
              ["Gender", student.gender],
              ["Age", `${ageFrom(student.dateOfBirth)} years`],
              ["Blood group", student.bloodGroup],
              ["Shift · version", `${student.shift} · ${student.version}`],
              ["Enrolled on", formatDate(student.enrolledOn)],
              ["Medical notes", profile.medicalNotes],
            ]}
          />
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">Attendance {new Date().getFullYear()}</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(
              [
                ["Rate", `${a.rate}%`, "text-indigo-600"],
                ["Present", a.present, "text-emerald-600"],
                ["Late", a.late, "text-amber-600"],
                ["Absent", a.absent, "text-rose-600"],
              ] as const
            ).map(([label, value, color]) => (
              <div key={label} className="rounded-xl bg-subtle px-2 py-3">
                <p className={cn("text-lg font-bold tabular-nums", color)}>{value}</p>
                <p className="text-[11px] text-fg-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">Guardians</h3>
          <ul className="space-y-2">
            {profile.guardians.map((g) => (
              <li key={g.role} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">
                    {g.name} {g.isPrimary && <Badge tone="info">Primary</Badge>}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {g.relation} · {g.occupation}
                  </p>
                </div>
                {g.phone && (
                  <a href={`tel:${g.phone}`} className={buttonStyles({ variant: "outline", size: "icon" })} aria-label={`Call ${g.name}`} title={g.phone}>
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {g.email && (
                  <a href={`mailto:${g.email}`} className={buttonStyles({ variant: "outline", size: "icon" })} aria-label={`Email ${g.name}`} title={g.email}>
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">Published results</h3>
          {results.length === 0 ? (
            <p className="text-sm text-fg-muted">No results published yet.</p>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {results.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="flex-1 font-medium text-fg">{e.name}</span>
                  <span className="tabular-nums text-fg-muted">
                    {e.total}/{e.outOf}
                  </span>
                  <span className="tabular-nums text-fg-muted">#{e.position}</span>
                  <Badge tone={gradeTone(e.grade)}>
                    {e.grade} · {e.gpa.toFixed(2)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Sheet>
  );
}
