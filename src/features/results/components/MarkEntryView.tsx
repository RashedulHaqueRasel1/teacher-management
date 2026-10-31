"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Lock, PenLine, RotateCcw, Save } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import { formatDate } from "@/features/admissions/utils";
import { useMyClasses } from "@/features/classes/hooks/use-my-classes";
import { sameSubject } from "@/features/classes/hooks/use-section";
import type { ExamSummary } from "@/features/examinations/hooks/use-exams";
import { useExams } from "@/features/examinations/hooks/use-exams";
import { STATUS_STYLE } from "@/features/examinations/utils";
import { gradeTone } from "@/features/students/components/profile/grade-utils";
import { localToday } from "@/features/students/demoData/profile-data";
import { useStudentProfiles } from "@/features/students/hooks/use-student-profiles";
import { useStudentAdminStore } from "@/features/students/store/student-admin.store";
import type { TeachingAssignment } from "@/features/teachers/types/types";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/store/confirm.store";
import { toast } from "@/store/toast.store";

import { buildSheet, hasResults, subjectGrade, type SheetRow, type SheetSubject } from "../utils";

type EntryRow = { row: SheetRow; subject: SheetSubject; value: number | undefined };

/**
 * Subject teachers hand in marks for their own subject and sections.
 * Published results are locked — corrections go through the office.
 * BACKEND: PUT /exams/:examId/marks { sectionId, subject, marks: [{ studentId, obtained }] }
 */
export function MarkEntryView() {
  const { assignments = [], teacher, hydrated } = useMyClasses();
  const { exams: allExams, hydrated: examsReady } = useExams();
  const { profiles, hydrated: profilesReady } = useStudentProfiles();
  const marks = useStudentAdminStore((s) => s.marks);
  const customSubjects = useStudentAdminStore((s) => s.customSubjects);
  const [examId, setExamId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  const exams = useMemo(() => allExams.filter(hasResults).sort((a, b) => b.startDate.localeCompare(a.startDate)), [allExams]);
  const exam = exams.find((e) => e.id === examId) ?? exams.find((e) => e.status === "completed" || e.status === "ongoing") ?? exams[0];
  const mine = exam ? assignments.filter((a) => exam.classes.includes(a.className)) : [];
  const assignment = mine.find((a) => a.id === assignmentId) ?? mine[0];

  // Memoized by the React Compiler.
  const customCodes = (id: string) => new Set((customSubjects[id] ?? []).map((s) => s.code));
  const entries: EntryRow[] =
    exam && assignment
      ? buildSheet(exam, assignment.className, profiles, marks, customCodes)
          .filter((r) => r.student.section === assignment.section)
          .flatMap((row) => {
            const subject = row.subjects.find((s) => sameSubject(s.name, assignment.subject));
            return subject ? [{ row, subject, value: row.marks[subject.column] }] : [];
          })
      : [];

  const ready = hydrated && examsReady && profilesReady && teacher;
  const header = <PageHeader title="Marks Entry" description="Enter marks for your subject, section by section. The office publishes results once every subject is in." />;

  if (!ready) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  if (!exam || mine.length === 0) {
    return (
      <div className="animate-fade-up">
        {header}
        <Card>
          <EmptyState icon={PenLine} title="Nothing to enter" description={exam ? "None of your classes sit this exam." : "No exam is open for marks yet."} />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {header}

      <Card className="flex flex-col gap-4 p-4 sm:px-5 lg:flex-row lg:items-center">
        <div className="w-full lg:w-72">
          <Select aria-label="Exam" value={exam.id} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {STATUS_STYLE[e.status].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {mine.map((a) => (
            <AssignmentChip key={a.id} assignment={a} active={a.id === assignment?.id} onClick={() => setAssignmentId(a.id)} />
          ))}
        </div>
      </Card>

      {assignment && entries.length > 0 ? (
        <EntrySheet key={`${exam.id}|${assignment.id}`} exam={exam} assignment={assignment} entries={entries} by={teacher.name} />
      ) : (
        <Card>
          <EmptyState icon={PenLine} title="No students take this paper" description="Pick another section or subject." />
        </Card>
      )}
    </div>
  );
}

function AssignmentChip({ assignment, active, onClick }: { assignment: TeachingAssignment; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
        active ? "border-indigo-500 bg-linear-to-b from-indigo-500 to-indigo-600 text-white shadow-glow" : "border-line text-fg-secondary hover:bg-soft hover:text-fg",
      )}
    >
      {assignment.className} · {assignment.section}
      <span className={cn("block text-[11px] font-medium", active ? "text-indigo-100" : "text-fg-muted")}>{assignment.subject}</span>
    </button>
  );
}

function EntrySheet({ exam, assignment, entries, by }: { exam: ExamSummary; assignment: TeachingAssignment; entries: EntryRow[]; by: string }) {
  const setMarks = useStudentAdminStore((s) => s.setMarks);
  const initial = () => Object.fromEntries(entries.map((e) => [e.row.student.id, e.value === undefined ? "" : String(e.value)]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const fullMarks = entries[0]!.subject.fullMarks;
  const paper = exam.papers.find((p) => p.className === assignment.className && sameSubject(p.subject, assignment.subject));
  const notHeld = paper && paper.date > localToday();
  const locked = exam.status === "published";
  const parse = (v: string) => (v.trim() === "" ? undefined : Number(v));
  const invalid = (e: EntryRow) => {
    const n = parse(values[e.row.student.id] ?? "");
    return n !== undefined && (!Number.isFinite(n) || n < 0 || n > e.subject.fullMarks || !Number.isInteger(n * 2));
  };
  const changed = entries.filter((e) => {
    const n = parse(values[e.row.student.id] ?? "");
    return n !== undefined && n !== e.value;
  });
  const bad = entries.filter(invalid);
  const filled = entries.filter((e) => parse(values[e.row.student.id] ?? "") !== undefined).length;

  async function save() {
    const ok = await confirmAction({
      title: "Submit marks?",
      description: `${assignment.subject} · ${assignment.className} ${assignment.section} · ${changed.length} student(s). Saved under your name.`,
      confirmLabel: "Submit marks",
    });
    if (!ok) return;
    for (const e of changed) setMarks(e.row.student.id, exam.id, exam.name, { [e.subject.code]: parse(values[e.row.student.id]!)! }, by);
    toast("Marks submitted", { description: `${assignment.subject} · ${changed.length} student(s)` });
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">
            {assignment.subject} <span className="font-normal text-fg-muted">· {exam.name} · out of {fullMarks}</span>
          </h2>
          <p className="text-xs text-fg-muted">
            {filled} of {entries.length} entered{paper && ` · paper on ${formatDate(paper.date)}`}. Press Enter to jump to the next student.
          </p>
        </div>
        {!locked && (
          <div className="flex items-center gap-2">
            {changed.length > 0 && <Badge tone="warning">{changed.length} unsaved</Badge>}
            <Button variant="outline" onClick={() => setValues(initial())} disabled={changed.length === 0}>
              <RotateCcw className="h-4 w-4" />
              Discard
            </Button>
            <Button onClick={save} disabled={changed.length === 0 || bad.length > 0}>
              <Save className="h-4 w-4" />
              Submit marks
            </Button>
          </div>
        )}
      </div>

      {(locked || notHeld || bad.length > 0) && (
        <p className={cn("flex items-center gap-2 border-b border-line px-4 py-2.5 text-sm sm:px-5", bad.length ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700")}>
          {locked ? <Lock className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {bad.length
            ? `${bad.length} mark(s) are not valid — use 0 to ${fullMarks} (halves allowed).`
            : locked
              ? "Results are published and locked. Ask the office to correct a mark."
              : `This paper is on ${formatDate(paper!.date)} — marks can be entered after it.`}
        </p>
      )}

      <div className="divide-y divide-line">
        {entries.map((e, i) => {
          const n = parse(values[e.row.student.id] ?? "");
          const wrong = invalid(e);
          const g = n !== undefined && !wrong ? subjectGrade(n, e.subject) : null;
          return (
            <div key={e.row.student.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
              <span className="w-8 text-center text-sm font-bold tabular-nums text-fg-subtle">{e.row.student.roll}</span>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <StudentAvatar name={e.row.student.name} photo={e.row.student.photo} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{e.row.student.name}</p>
                  <p className="truncate text-xs text-fg-muted">
                    {e.row.student.id}
                    {e.subject.name !== assignment.subject && ` · ${e.subject.name}`}
                  </p>
                </div>
              </div>
              <span className="hidden w-16 justify-end sm:flex">{g && <Badge tone={gradeTone(g.grade)}>{g.grade}</Badge>}</span>
              <input
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="number"
                inputMode="decimal"
                min={0}
                max={e.subject.fullMarks}
                step={0.5}
                disabled={Boolean(notHeld) || locked}
                value={values[e.row.student.id] ?? ""}
                onChange={(ev) => setValues((v) => ({ ...v, [e.row.student.id]: ev.target.value }))}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    inputs.current[i + 1]?.focus();
                    inputs.current[i + 1]?.select();
                  }
                }}
                aria-label={`${e.row.student.name} ${assignment.subject} marks`}
                placeholder="—"
                className={cn(
                  "h-10 w-20 rounded-xl border bg-surface px-3 text-right text-sm font-semibold tabular-nums text-fg shadow-card focus:outline-none focus:ring-4 disabled:opacity-50",
                  wrong ? "border-rose-400 focus:ring-rose-500/10" : g?.gp === 0 ? "border-rose-300 text-rose-600 focus:border-indigo-400 focus:ring-indigo-500/10" : "border-line-strong focus:border-indigo-400 focus:ring-indigo-500/10",
                )}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
