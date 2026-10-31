"use client";

import Link from "next/link";
import { BookOpen, CalendarCheck, CalendarClock, MailCheck, PenLine, Sparkles, UsersRound } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { ACADEMIC_SESSION } from "@/features/admissions/constants";
import { formatDate } from "@/features/admissions/utils";

type Props = {
  name: string;
  classesToday: number;
  students: number;
  pendingLeave: number;
  attendanceRate: number;
  off: string | null;
  today: string;
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Dashboard hero: greeting, today's date and four quick numbers. */
export function TeacherWelcome({ name, classesToday, students, pendingLeave, attendanceRate, off, today }: Props) {
  const highlights = [
    { label: "Classes today", value: classesToday, icon: BookOpen },
    { label: "My students", value: students, icon: UsersRound },
    { label: "Leave to review", value: pendingLeave, icon: MailCheck },
    { label: "My attendance", value: `${attendanceRate}%`, icon: CalendarCheck },
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-navy-950 px-6 py-8 text-white shadow-card ring-1 ring-transparent sm:px-10 sm:py-10 dark:ring-white/10">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid-white [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_65%)]" />
      <div aria-hidden className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-emerald-500/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-inset ring-white/15">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Academic Year {ACADEMIC_SESSION} · {formatDate(today)}
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-[32px] sm:leading-tight">
            {greeting()}, {name.split(" ")[0]}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
            {off ? (
              <>
                No classes today — <span className="font-semibold text-white">{off}</span>.
              </>
            ) : (
              <>
                You have <span className="font-semibold text-white">{classesToday} class{classesToday === 1 ? "" : "es"}</span> today
                {pendingLeave > 0 && (
                  <>
                    {" "}and <span className="font-semibold text-amber-300">{pendingLeave} leave request{pendingLeave === 1 ? "" : "s"}</span> waiting for you
                  </>
                )}
                .
              </>
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/attendance" className={buttonStyles({ variant: "white" })}>
              <CalendarCheck className="h-4 w-4" />
              Take Attendance
            </Link>
            <Link href="/marks" className={buttonStyles({ variant: "glass" })}>
              <PenLine className="h-4 w-4" />
              Enter Marks
            </Link>
            <Link href="/routine" className={buttonStyles({ variant: "glass" })}>
              <CalendarClock className="h-4 w-4" />
              My Routine
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:w-[420px]">
          {highlights.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-sm transition hover:bg-white/[0.09]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-200">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xl font-bold tabular-nums tracking-tight">{value}</p>
              <p className="mt-0.5 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
