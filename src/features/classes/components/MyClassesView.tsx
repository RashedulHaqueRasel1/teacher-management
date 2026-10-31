"use client";

import Link from "next/link";
import { BookOpen, Crown, DoorOpen, School, Sun, UsersRound } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { sectionCode } from "../demoData/mock-data";
import { useMyClasses } from "../hooks/use-my-classes";

/** Every section the teacher is class teacher of or teaches a subject in. */
export function MyClassesView() {
  const { sections, assignments = [], hydrated } = useMyClasses();
  const periods = assignments.reduce((sum, a) => sum + a.periodsPerWeek, 0);

  const tiles = [
    { label: "Sections", value: sections.length, icon: School, accent: "bg-indigo-50 text-indigo-600" },
    { label: "Class teacher of", value: sections.filter((s) => s.isClassTeacher).length, icon: Crown, accent: "bg-amber-50 text-amber-600" },
    { label: "Subjects taught", value: assignments.length, icon: BookOpen, accent: "bg-emerald-50 text-emerald-600" },
    { label: "Periods / week", value: periods, icon: UsersRound, accent: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="My Classes" description="Sections you teach this session. Open a section to see its students, your periods and attendance." />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="flex items-center gap-4 p-5">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", accent)}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-fg-muted">{label}</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-fg">{hydrated ? value : "–"}</p>
            </div>
          </Card>
        ))}
      </div>

      {hydrated && sections.length === 0 ? (
        <Card>
          <EmptyState icon={School} title="No classes yet" description="The school office hasn't assigned any classes to you. Contact the admin if this looks wrong." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {sections.map((s) => (
            <Link key={s.key} href={`/classes/${s.slug}`} className="group">
              <Card className="h-full p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-glow">
                    {sectionCode(s.className, s.section)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-fg group-hover:text-indigo-600">
                      {s.className} · Section {s.section}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {s.level} · {s.settings.version} version
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.isClassTeacher && (
                        <Badge tone="warning">
                          <Crown className="h-3 w-3" />
                          Class teacher
                        </Badge>
                      )}
                      {s.assignments.map((a) => (
                        <Badge key={a.id} tone="info">
                          {a.subject} · {a.periodsPerWeek}/wk
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-xs">
                  <div>
                    <dt className="flex items-center gap-1 text-fg-muted">
                      <UsersRound className="h-3.5 w-3.5" /> Students
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">{s.students.length}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-fg-muted">
                      <DoorOpen className="h-3.5 w-3.5" /> Room
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-fg">{s.settings.room || "—"}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-fg-muted">
                      <Sun className="h-3.5 w-3.5" /> Shift
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-fg">{s.settings.shift}</dd>
                  </div>
                </dl>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
