"use client";

import { useState } from "react";
import { CalendarPlus, CalendarRange, Undo2 } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartTooltip, useTooltip } from "@/components/ui/tooltip";
import { formatDate, formatDateTime } from "@/features/admissions/utils";
import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { schoolDaysBetween } from "@/features/students/demoData/profile-data";
import { TEACHER_LEAVE_LABEL } from "@/features/teachers/demoData/mock-data";
import { useTeacherAdminStore } from "@/features/teachers/store/teacher-admin.store";
import type { TeacherLeave } from "@/features/teachers/types/types";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/store/confirm.store";
import { toast } from "@/store/toast.store";

import { ApplyLeaveDialog } from "./ApplyLeaveDialog";

const STATUS: Record<TeacherLeave["status"], { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

/**
 * The teacher's own leave: yearly balance, apply, history.
 * BACKEND: GET /me/leaves · POST /me/leaves · DELETE /me/leaves/:id (pending only)
 */
export function MyLeaveView() {
  const { teacher, leaves = [], leaveUsage = [], weekend, hydrated } = useCurrentTeacher();
  const created = useTeacherAdminStore((s) => s.leaveRequests);
  const withdrawLeave = useTeacherAdminStore((s) => s.withdrawLeave);
  const [applying, setApplying] = useState(false);
  const tip = useTooltip();
  if (!hydrated || !teacher || !weekend) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;

  async function withdraw(l: TeacherLeave) {
    const ok = await confirmAction({ title: "Withdraw this request?", description: `${TEACHER_LEAVE_LABEL[l.type]} · ${formatDate(l.from)} → ${formatDate(l.to)}`, confirmLabel: "Withdraw", tone: "danger" });
    if (!ok) return;
    withdrawLeave(l, teacher!.name);
    toast("Leave request withdrawn");
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="My Leave"
        description="Your leave balance for this year and every request you've made."
        actions={
          <Button onClick={() => setApplying(true)}>
            <CalendarPlus className="h-4 w-4" />
            Apply for leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {leaveUsage.map((u) => {
          const pct = u.quota ? Math.min(100, Math.round((u.used / u.quota) * 100)) : 0;
          const pending = leaves.filter((l) => l.type === u.type && l.status === "pending").reduce((sum, l) => sum + schoolDaysBetween(l.from, l.to, weekend).length, 0);
          const tone = pct > 80 ? "bg-rose-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <Card key={u.type} className="p-5">
              <p className="text-sm font-medium text-fg-muted">{u.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-fg">
                {u.left}
                <span className="text-sm font-medium text-fg-muted"> / {u.quota} left</span>
              </p>
              <div
                tabIndex={0}
                aria-label={`${u.label}: ${u.used} of ${u.quota} days used`}
                {...tip.trigger(
                  <ChartTooltip
                    title={u.label}
                    subtitle={`${pct}% of this year's ${u.quota} days used`}
                    rows={[
                      { label: "Used", value: `${u.used} day${u.used === 1 ? "" : "s"}`, color: tone },
                      { label: "Waiting for approval", value: `${pending} day${pending === 1 ? "" : "s"}`, color: "bg-sky-400", muted: pending === 0 },
                      { label: "Left", value: `${u.left} day${u.left === 1 ? "" : "s"}`, color: "bg-slate-500" },
                    ]}
                  />,
                )}
                className="group/bar -my-2 mt-1 cursor-default rounded-full py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <div className="h-2 overflow-hidden rounded-full bg-soft transition-[height] duration-200 group-hover/bar:h-2.5">
                  <div className={cn("h-full rounded-full transition-[width] duration-500", tone)} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <p className="mt-2 text-xs text-fg-muted">{u.used} day(s) used</p>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Requests</h2>
          <p className="mt-0.5 text-xs text-fg-muted">Pending requests can be withdrawn until the office decides.</p>
        </div>
        {leaves.length === 0 ? (
          <EmptyState icon={CalendarRange} title="No leave yet" description="Requests you send appear here with the office's decision." />
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {leaves.map((l) => {
              const days = schoolDaysBetween(l.from, l.to, weekend).length;
              const mine = created.some((c) => c.id === l.id);
              return (
                <li key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-fg">{TEACHER_LEAVE_LABEL[l.type]}</p>
                      <Badge tone={STATUS[l.status].tone} dot>
                        {STATUS[l.status].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-fg-secondary">
                      {formatDate(l.from)}
                      {l.to !== l.from && ` → ${formatDate(l.to)}`} · {days} school day{days === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-sm text-fg-muted">{l.reason}</p>
                    <p className="mt-1 text-xs text-fg-subtle">Applied {formatDateTime(l.submittedAt)}</p>
                    {l.decision && (
                      <p className="mt-2 border-l-2 border-line pl-3 text-xs text-fg-muted">
                        {l.status === "approved" ? "Approved" : "Rejected"} by {l.decision.by} · {formatDateTime(l.decision.at)}
                        {l.decision.note && ` — ${l.decision.note}`}
                        {l.substitute && ` · Substitute: ${l.substitute}`}
                      </p>
                    )}
                  </div>
                  {l.status === "pending" && mine && (
                    <Button size="sm" variant="outline" onClick={() => withdraw(l)}>
                      <Undo2 className="h-3.5 w-3.5" />
                      Withdraw
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {tip.node}
      {applying && <ApplyLeaveDialog teacher={teacher} usage={leaveUsage} leaves={leaves} weekend={weekend} onClose={() => setApplying(false)} />}
    </div>
  );
}
