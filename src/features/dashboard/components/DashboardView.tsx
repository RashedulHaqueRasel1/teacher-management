"use client";

import { DashboardEvents } from "@/features/events/components/DashboardEvents";
import { DashboardNotices } from "@/features/notices/components/DashboardNotices";
import { useMyClasses } from "@/features/classes/hooks/use-my-classes";
import { summarize } from "@/features/students/components/profile/attendance-utils";
import { TodayCard } from "@/features/students/components/profile/TodayCard";
import { useClassLeaveRequests } from "@/features/students/hooks/use-class-leave-requests";

import { useTodaySchedule } from "../hooks/use-today";
import { MyClassesCard } from "./MyClassesCard";
import { TeacherWelcome } from "./TeacherWelcome";
import { TodaySchedule } from "./TodaySchedule";

/** The teacher's home page. */
export function DashboardView() {
  const { teacher, routine, weekend, shift, attendance, sections, students, hydrated } = useMyClasses();
  const { pending } = useClassLeaveRequests();
  const { today, off, periods } = useTodaySchedule(routine, teacher?.shift, weekend);
  if (!teacher || !hydrated || !attendance || !shift) return <DashboardSkeleton />;
  const rate = summarize(attendance.filter((d) => d.date.startsWith(today.slice(0, 4)))).rate;

  return (
    <div className="animate-fade-up space-y-6">
      <TeacherWelcome name={teacher.name} classesToday={periods.length} students={students.length} pendingLeave={pending.length} attendanceRate={rate} off={off} today={today} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TodaySchedule periods={periods} off={off} />
        </div>
        <TodayCard days={attendance} shift={shift} weekend={weekend} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <MyClassesCard sections={sections} />
        <DashboardNotices />
        <DashboardEvents />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-64 animate-pulse rounded-3xl bg-soft" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-soft xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-soft" />
      </div>
    </div>
  );
}
