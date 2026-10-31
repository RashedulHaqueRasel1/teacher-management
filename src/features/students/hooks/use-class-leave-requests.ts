"use client";

import { useMemo } from "react";

import { useMyClasses } from "@/features/classes/hooks/use-my-classes";

import { useStudentAdminHydrated, useStudentAdminStore } from "../store/student-admin.store";
import type { LeaveRequest, Student } from "../types/types";
import { studentLeaveRequests } from "./use-student";

export type ClassLeaveRequest = LeaveRequest & { student: Student };

/**
 * Leave requests of students in the signed-in teacher's class-teacher sections.
 * Stage "teacher" = waiting for this teacher; after approval it goes to the admin.
 * TODO (backend phase): GET /me/student-leaves?stage=
 */
export function useClassLeaveRequests() {
  const { classTeacherSections, hydrated: classesReady, teacher } = useMyClasses();
  const adminReady = useStudentAdminHydrated();
  const admin = useStudentAdminStore();

  const requests = useMemo<ClassLeaveRequest[]>(() => {
    if (!adminReady) return [];
    return classTeacherSections
      .flatMap((s) => s.students)
      .flatMap((student) => studentLeaveRequests(student, admin).map((r) => ({ ...r, student })))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [classTeacherSections, admin, adminReady]);

  return {
    teacher,
    requests,
    pending: requests.filter((r) => r.stage === "teacher"),
    classTeacherSections,
    hydrated: classesReady && adminReady,
  };
}
