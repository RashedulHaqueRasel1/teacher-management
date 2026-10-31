"use client";

import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useCalendar } from "../hooks/use-calendar";
import type { CalendarItem } from "../types/types";
import { CATEGORY_STYLE, MONTH_NAMES, dayCount, whenLabel } from "../utils";

type Tab = "upcoming" | "holidays" | "past";

/**
 * School calendar for teachers: events, exams and holidays (read-only).
 * TODO (backend phase): GET /calendar?audience=teachers
 */
export function EventsBoardView() {
  const { items, today, hydrated } = useCalendar();
  const [tab, setTab] = useState<Tab>("upcoming");
  const relevant = items.filter((i) => i.groups.includes("teachers") || i.closed);

  const lists: Record<Tab, CalendarItem[]> = {
    upcoming: relevant.filter((i) => i.endDate >= today),
    holidays: relevant.filter((i) => i.closed && i.startDate.slice(0, 4) === today.slice(0, 4)),
    past: relevant.filter((i) => i.endDate < today).reverse(),
  };
  const list = lists[tab];
  const byMonth = new Map<string, CalendarItem[]>();
  for (const i of list) byMonth.set(i.startDate.slice(0, 7), [...(byMonth.get(i.startDate.slice(0, 7)) ?? []), i]);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Events & Holidays" description="School events, exams and holidays that concern teachers." />

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-card">
        {(
          [
            ["upcoming", "Upcoming"],
            ["holidays", `Holidays ${today.slice(0, 4)}`],
            ["past", "Past"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
              tab === key ? "bg-linear-to-b from-indigo-500 to-indigo-600 text-white shadow-glow" : "text-fg-muted hover:bg-soft hover:text-fg",
            )}
          >
            {label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", tab === key ? "bg-white/25" : "bg-soft")}>{hydrated ? lists[key].length : "–"}</span>
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="h-80 animate-pulse rounded-2xl bg-soft" />
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarDays} title="Nothing here" description="No items on the calendar for this view." />
        </Card>
      ) : (
        <div className="space-y-8">
          {[...byMonth.entries()].map(([month, entries]) => (
            <section key={month}>
              <h2 className="mb-3 text-sm font-semibold text-fg-muted">
                {MONTH_NAMES[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}
              </h2>
              <div className="space-y-3">
                {entries.map((i) => {
                  const style = CATEGORY_STYLE[i.category];
                  const Icon = style.icon;
                  const days = dayCount(i);
                  const live = i.startDate <= today && i.endDate >= today;
                  return (
                    <Card key={i.id} className="flex gap-4 p-4 sm:p-5">
                      <div className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl", style.tile)}>
                        <span className="text-lg font-bold leading-none tabular-nums">{i.startDate.slice(8)}</span>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase">{MONTH_NAMES[Number(i.startDate.slice(5, 7)) - 1]!.slice(0, 3)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-fg">{i.title}</p>
                          <Badge tone={style.tone}>
                            <Icon className="h-3 w-3" />
                            {i.category}
                          </Badge>
                          {i.closed && <Badge tone="success">School closed</Badge>}
                          {live && <Badge tone="info" dot>Today</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-fg-secondary">
                          {whenLabel(i)}
                          {days > 1 && ` · ${days} days`}
                        </p>
                        {i.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
                            <MapPin className="h-3.5 w-3.5" />
                            {i.location}
                          </p>
                        )}
                        {i.description && <p className="mt-2 text-sm text-fg-muted">{i.description}</p>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
