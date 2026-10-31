"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, Paperclip, Pin, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useNotices } from "../hooks/use-notices";
import { CATEGORY_STYLE, audienceLabel, noticeHref, relativeTime } from "../utils";

/**
 * Published notices, staff notices first. Read-only — the office publishes.
 * TODO (backend phase): GET /notices?audience=teachers&status=published
 */
export function NoticeBoardView() {
  const { notices, now, hydrated } = useNotices();
  const [scope, setScope] = useState<"teachers" | "all">("teachers");
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const live = notices.filter((n) => n.status === "published");
  const list = live
    .filter((n) => scope === "all" || n.groups.includes("teachers"))
    .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Notices" description="Announcements from the school office." />

      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex rounded-xl bg-soft p-1">
          {(
            [
              ["teachers", `For teachers (${live.filter((n) => n.groups.includes("teachers")).length})`],
              ["all", `All notices (${live.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              aria-pressed={scope === key}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold transition", scope === key ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <Input leftIcon={<Search />} placeholder="Search notices…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search notices" />
        </div>
      </Card>

      {!hydrated ? (
        <div className="h-80 animate-pulse rounded-2xl bg-soft" />
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No notices" description="Nothing matches — try All notices or clear the search." />
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((n) => {
            const style = CATEGORY_STYLE[n.category];
            const Icon = style.icon;
            return (
              <Link key={n.id} href={noticeHref(n)} className="group block">
                <Card className="flex gap-4 p-5 transition group-hover:shadow-card-hover">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.tile)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.pinned && <Pin className="h-3.5 w-3.5 text-amber-500" aria-label="Pinned" />}
                      <p className="font-semibold text-fg group-hover:text-indigo-600">{n.title}</p>
                      <Badge tone={style.tone}>{n.category}</Badge>
                      {n.priority !== "normal" && <Badge tone={n.priority === "urgent" ? "danger" : "warning"}>{n.priority === "urgent" ? "Urgent" : "Important"}</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{n.body}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
                      <span>{relativeTime(n.publishAt!, now)}</span>
                      <span>{audienceLabel(n)}</span>
                      {n.attachment && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {n.attachment.name}
                        </span>
                      )}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
