"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMyClasses } from "@/features/classes/hooks/use-my-classes";

import { useStudentProfiles } from "../hooks/use-student-profiles";
import { StudentRosterTable, type RosterRow } from "./StudentRosterTable";
import { StudentSheet } from "./StudentSheet";

/** Every student in the teacher's sections, searchable. Read-only. */
export function MyStudentsView() {
  const { sections, hydrated } = useMyClasses();
  const { profiles, hydrated: profilesReady } = useStudentProfiles();
  const [search, setSearch] = useState("");
  const [sectionKey, setSectionKey] = useState("all");
  const [open, setOpen] = useState<RosterRow | null>(null);

  const rows = useMemo<RosterRow[]>(() => {
    const q = search.trim().toLowerCase();
    return sections
      .filter((s) => sectionKey === "all" || s.key === sectionKey)
      .flatMap((s) => s.students)
      .filter((st, i, all) => all.findIndex((x) => x.id === st.id) === i)
      .filter((st) => !q || [st.name, st.id, st.guardianName, st.phone, String(st.roll)].some((v) => v.toLowerCase().includes(q)))
      .flatMap((st) => (profiles.get(st.id) ? [profiles.get(st.id)!] : []));
  }, [sections, sectionKey, search, profiles]);

  return (
    <div className="animate-fade-up">
      <PageHeader title="My Students" description="Students of the sections you teach. Click a student for guardians, attendance and results." />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:px-5">
          <div className="flex-1">
            <Input leftIcon={<Search />} placeholder="Search by name, ID, roll or guardian…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
          </div>
          <div className="sm:w-60">
            <Select aria-label="Section" value={sectionKey} onChange={(e) => setSectionKey(e.target.value)} className="h-11">
              <option value="all">All my sections</option>
              {sections.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.className} · {s.section}
                  {s.isClassTeacher ? " (class teacher)" : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {!hydrated || !profilesReady ? (
          <div className="h-80 animate-pulse bg-soft" />
        ) : rows.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students found" description="Try a different search or section." />
        ) : (
          <>
            <StudentRosterTable rows={rows} showClass onOpen={setOpen} />
            <p className="border-t border-line px-5 py-3 text-xs text-fg-muted sm:px-6">{rows.length} student(s)</p>
          </>
        )}
      </Card>

      {open && <StudentSheet student={open.student} profile={open.profile} onClose={() => setOpen(null)} />}
    </div>
  );
}
