"use client";

import { useEffect, useState } from "react";

import { SHIFTS, holidayName, localToday, offDayNote, weekdayOf } from "@/features/students/demoData/profile-data";
import { PERIOD_MINUTES } from "@/features/teachers/demoData/mock-data";
import type { RoutineSlot, WeekendPlan } from "@/features/teachers/types/types";

export type TodayPeriod = RoutineSlot & { start: number; end: number; state: "done" | "now" | "next" | "later" };

/** Minutes since midnight, refreshed every 30 seconds. Read on the client only (never during prerender). */
function useNowMinutes() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/**
 * Today's periods from the teacher's routine with live "now / next" state,
 * or why there are no classes today (weekend / holiday).
 */
export function useTodaySchedule(routine: RoutineSlot[] | undefined, shiftName: string | undefined, weekend: WeekendPlan | undefined) {
  const now = useNowMinutes();
  // Dates are read once the routine has loaded on the client, never during prerender.
  const today = routine ? localToday() : "";
  const off = today ? (holidayName(today) ?? offDayNote(today, weekend)) : null;
  const shiftStart = (SHIFTS[shiftName ?? "Morning"] ?? SHIFTS.Morning!).start;

  const list = (off ? [] : (routine ?? []).filter((s) => s.day === weekdayOf(today)))
    .sort((a, b) => a.period - b.period)
    .map((s) => {
      const start = shiftStart + (s.period - 1) * PERIOD_MINUTES;
      return { ...s, start, end: start + PERIOD_MINUTES };
    });
  const nextIndex = list.findIndex((p) => p.end > now);
  const periods: TodayPeriod[] = list.map((p, i) => ({
    ...p,
    state: p.end <= now ? "done" : p.start <= now ? "now" : i === nextIndex ? "next" : "later",
  }));

  return { today, off, periods, now };
}
