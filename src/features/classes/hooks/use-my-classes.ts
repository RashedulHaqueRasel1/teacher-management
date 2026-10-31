"use client";

import { useMemo } from "react";

import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import type { Student } from "@/features/students/types/types";
import type { TeachingAssignment } from "@/features/teachers/types/types";

import type { ClassSection } from "../types/types";
import { useClasses } from "./use-classes";

export type MySection = ClassSection & {
  /** The signed-in teacher is this section's class teacher. */
  isClassTeacher: boolean;
  /** Subjects the signed-in teacher takes in this section. */
  assignments: TeachingAssignment[];
};

/**
 * Sections the signed-in teacher works with: class-teacher sections first,
 * then the sections they teach a subject in.
 * TODO (backend phase): GET /me/sections
 */
export function useMyClasses() {
  const me = useCurrentTeacher();
  const { sections, hydrated: classesReady } = useClasses();
  const teacherId = me.teacher?.id;
  const assignments = me.assignments;

  const mySections = useMemo<MySection[]>(() => {
    if (!teacherId || !assignments) return [];
    return sections
      .filter((s) => !s.archived)
      .map((s) => ({
        ...s,
        isClassTeacher: s.classTeacher.id === teacherId,
        assignments: assignments.filter((a) => a.className === s.className && a.section === s.section),
      }))
      .filter((s) => s.isClassTeacher || s.assignments.length > 0)
      .sort((a, b) => Number(b.isClassTeacher) - Number(a.isClassTeacher));
  }, [sections, teacherId, assignments]);

  const students = useMemo(() => {
    const map = new Map<string, Student>();
    for (const s of mySections) for (const st of s.students) map.set(st.id, st);
    return [...map.values()];
  }, [mySections]);

  return {
    ...me,
    hydrated: me.hydrated && classesReady,
    sections: mySections,
    classTeacherSections: mySections.filter((s) => s.isClassTeacher),
    students,
  };
}
