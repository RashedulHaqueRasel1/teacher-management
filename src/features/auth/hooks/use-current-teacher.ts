"use client";

import { useMemo } from "react";

import { useTeacher } from "@/features/teachers/hooks/use-teacher";
import { useTeachers } from "@/features/teachers/hooks/use-teachers";
import { teacherSlug } from "@/features/teachers/utils";

import { useSessionHydrated, useSessionStore } from "../store/session.store";

/**
 * The signed-in teacher with everything the portal shows about them
 * (attendance, leave, classes & routine, salary, account).
 * TODO (backend phase): GET /me (+ /me/attendance, /me/leaves, /me/salary …)
 */
export function useCurrentTeacher() {
  const sessionReady = useSessionHydrated();
  const teacherId = useSessionStore((s) => s.teacherId);
  const { teachers } = useTeachers();
  const me = useMemo(() => teachers.find((t) => t.id === teacherId && t.status !== "left"), [teachers, teacherId]);
  const data = useTeacher(me ? teacherSlug(me) : "");

  return {
    ...data,
    /** Session read and teacher data loaded. */
    hydrated: sessionReady && data.hydrated,
    signedIn: Boolean(teacherId),
    teacher: me ? data.teacher : undefined,
  };
}
