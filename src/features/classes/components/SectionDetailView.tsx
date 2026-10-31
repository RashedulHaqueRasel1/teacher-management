"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Clock, Crown, DoorOpen, Phone, School, Sun, UsersRound } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudentRosterTable, type RosterRow } from "@/features/students/components/StudentRosterTable";
import { StudentSheet } from "@/features/students/components/StudentSheet";
import { useStudentProfiles } from "@/features/students/hooks/use-student-profiles";
import { DAY_NAMES, periodTime } from "@/features/teachers/demoData/mock-data";

import { sectionCode } from "../demoData/mock-data";
import { useMyClasses } from "../hooks/use-my-classes";

/** One of the teacher's sections: details, their periods there and the student list. */
export function SectionDetailView({ slug }: { slug: string }) {
  const { sections, routine = [], teacher, hydrated } = useMyClasses();
  const { profiles, hydrated: profilesReady } = useStudentProfiles();
  const [open, setOpen] = useState<RosterRow | null>(null);
  const section = sections.find((s) => s.slug === slug);

  const rows = useMemo<RosterRow[]>(
    () => (section ? section.students.flatMap((st) => (profiles.get(st.id) ? [profiles.get(st.id)!] : [])) : []),
    [section, profiles],
  );

  if (!hydrated || !teacher) return <div className="h-96 animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  if (!section) {
    return (
      <Card>
        <EmptyState
          icon={School}
          title="Section not found"
          description="This section isn't one of your classes, or the link is outdated."
          action={
            <Link href="/classes" className={buttonStyles({ variant: "outline" })}>
              <ArrowLeft className="h-4 w-4" />
              My classes
            </Link>
          }
        />
      </Card>
    );
  }

  const myPeriods = routine
    .filter((r) => r.assignment.className === section.className && r.assignment.section === section.section)
    .sort((a, b) => ((a.day + 1) % 7) - ((b.day + 1) % 7) || a.period - b.period);

  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/classes" className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" />
        My classes
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-glow">
            {sectionCode(section.className, section.section)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-fg">
              {section.className} · Section {section.section}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {section.isClassTeacher && (
                <Badge tone="warning">
                  <Crown className="h-3 w-3" />
                  You are the class teacher
                </Badge>
              )}
              {section.assignments.map((a) => (
                <Badge key={a.id} tone="info">
                  {a.subject} · {a.periodsPerWeek} periods/week
                </Badge>
              ))}
            </div>
          </div>
          {section.isClassTeacher && (
            <Link href={`/attendance?section=${section.slug}`} className={buttonStyles()}>
              <CalendarCheck className="h-4 w-4" />
              Attendance register
            </Link>
          )}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm lg:grid-cols-4">
          {(
            [
              [UsersRound, "Students", section.students.length],
              [DoorOpen, "Room", section.settings.room || "—"],
              [Sun, "Shift · version", `${section.settings.shift} · ${section.settings.version}`],
              [Crown, "Class teacher", section.isClassTeacher ? "You" : section.classTeacher.name],
            ] as const
          ).map(([Icon, label, value]) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-xs text-fg-muted">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </dt>
              <dd className="mt-0.5 font-semibold text-fg">
                {value}
                {label === "Class teacher" && !section.isClassTeacher && section.classTeacher.phone && (
                  <a href={`tel:${section.classTeacher.phone}`} className="ml-2 inline-flex text-fg-subtle hover:text-indigo-600" aria-label={`Call ${section.classTeacher.name}`}>
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {myPeriods.length > 0 && (
        <Card className="p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Your periods in this section</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {myPeriods.map((p) => (
              <span key={`${p.day}-${p.period}`} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs">
                <span className="font-semibold text-fg">{DAY_NAMES[p.day]}</span>
                <span className="text-fg-muted">
                  P{p.period} · {p.assignment.subject}
                </span>
                <span className="flex items-center gap-1 tabular-nums text-fg-subtle">
                  <Clock className="h-3 w-3" />
                  {periodTime(teacher.shift, p.period)}
                </span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Students</h2>
          <p className="mt-0.5 text-xs text-fg-muted">Click a student to see guardians, attendance and results.</p>
        </div>
        <div className="mt-4">
          {!profilesReady ? (
            <div className="h-64 animate-pulse bg-soft" />
          ) : rows.length === 0 ? (
            <EmptyState icon={UsersRound} title="No students yet" description="Students appear here once they are enrolled in this section." />
          ) : (
            <StudentRosterTable rows={rows} onOpen={setOpen} />
          )}
        </div>
      </Card>

      {open && <StudentSheet student={open.student} profile={open.profile} onClose={() => setOpen(null)} />}
    </div>
  );
}
