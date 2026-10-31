"use client";

import { useState } from "react";
import { CheckCircle2, Download, MailCheck, Paperclip, XCircle } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import { formatDate, formatDateTime } from "@/features/admissions/utils";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast.store";

import { LEAVE_TYPES, schoolDaysBetween } from "../demoData/profile-data";
import { type ClassLeaveRequest, useClassLeaveRequests } from "../hooks/use-class-leave-requests";
import { downloadLeaveAttachment } from "../leave-files";
import { useStudentAdminStore } from "../store/student-admin.store";
import type { LeaveStage } from "../types/types";

const STAGE: Record<LeaveStage, { label: string; tone: BadgeTone }> = {
  teacher: { label: "Waiting for you", tone: "warning" },
  admin: { label: "With the office", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

type Filter = "teacher" | "admin" | "done";

/**
 * Class teacher's step of the student leave workflow:
 * student → class teacher (recommend / reject) → office (final).
 * BACKEND: POST /student-leaves/:id/decision { role: "class-teacher", approved, note }
 */
export function StudentLeaveView() {
  const { requests, classTeacherSections, teacher, hydrated } = useClassLeaveRequests();
  const [filter, setFilter] = useState<Filter>("teacher");
  const [deciding, setDeciding] = useState<{ request: ClassLeaveRequest; approve: boolean } | null>(null);

  const groups: Record<Filter, ClassLeaveRequest[]> = {
    teacher: requests.filter((r) => r.stage === "teacher"),
    admin: requests.filter((r) => r.stage === "admin"),
    done: requests.filter((r) => r.stage === "approved" || r.stage === "rejected"),
  };
  const list = groups[filter];
  const header = <PageHeader title="Student Leave" description="Leave requests from students of your class. Your recommendation goes to the office for the final decision." />;

  if (!hydrated || !teacher) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  if (classTeacherSections.length === 0) {
    return (
      <div className="animate-fade-up">
        {header}
        <Card>
          <EmptyState icon={MailCheck} title="You are not a class teacher" description="Student leave requests go to the class teacher of each section." />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {header}

      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-card">
        {(
          [
            ["teacher", "Waiting for you"],
            ["admin", "Sent to office"],
            ["done", "Decided"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
              filter === key ? "bg-linear-to-b from-indigo-500 to-indigo-600 text-white shadow-glow" : "text-fg-muted hover:bg-soft hover:text-fg",
            )}
          >
            {label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", filter === key ? "bg-white/25" : key === "teacher" && groups.teacher.length ? "bg-amber-500 text-white" : "bg-soft")}>
              {groups[key].length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={MailCheck} title="All clear" description={filter === "teacher" ? "No leave request is waiting for you." : "Nothing here yet."} />
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const days = schoolDaysBetween(r.from, r.to).length;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <StudentAvatar name={r.student.name} photo={r.student.photo} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-fg">{r.student.name}</p>
                        <span className="text-xs text-fg-muted">
                          {r.student.className} · {r.student.section} · Roll {r.student.roll}
                        </span>
                        <Badge tone={STAGE[r.stage].tone} dot>
                          {STAGE[r.stage].label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-fg-secondary">
                        {LEAVE_TYPES[r.type]} · {formatDate(r.from)}
                        {r.to !== r.from && ` → ${formatDate(r.to)}`} · {days} school day{days === 1 ? "" : "s"}
                      </p>
                      <p className="mt-2 text-sm text-fg-muted">&ldquo;{r.reason}&rdquo;</p>
                      <p className="mt-2 text-xs text-fg-subtle">
                        Submitted {formatDateTime(r.submittedAt)} · {r.submittedBy}
                      </p>
                      {r.attachment && (
                        <button
                          type="button"
                          onClick={() => downloadLeaveAttachment(r, r.student).catch(() => toast("Download failed", { tone: "error" }))}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-soft px-2.5 py-1 text-xs font-medium text-fg-secondary hover:text-indigo-600"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          {r.attachment}
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(r.teacherDecision || r.adminDecision) && (
                        <ul className="mt-3 space-y-1 border-l-2 border-line pl-3 text-xs text-fg-muted">
                          {r.teacherDecision && (
                            <li>
                              <span className="font-semibold text-fg-secondary">{r.teacherDecision.approved ? "Recommended" : "Rejected"}</span> by {r.teacherDecision.by} · {formatDateTime(r.teacherDecision.at)}
                              {r.teacherDecision.note && ` — ${r.teacherDecision.note}`}
                            </li>
                          )}
                          {r.adminDecision && (
                            <li>
                              <span className="font-semibold text-fg-secondary">{r.adminDecision.approved ? "Approved" : "Rejected"}</span> by the office ({r.adminDecision.by}) · {formatDateTime(r.adminDecision.at)}
                              {r.adminDecision.note && ` — ${r.adminDecision.note}`}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  {r.stage === "teacher" && (
                    <div className="flex gap-2 lg:flex-col">
                      <Button size="sm" onClick={() => setDeciding({ request: r, approve: true })}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Recommend
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeciding({ request: r, approve: false })}>
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {deciding && <DecisionDialog request={deciding.request} approve={deciding.approve} by={teacher.name} onClose={() => setDeciding(null)} />}
    </div>
  );
}

function DecisionDialog({ request, approve, by, onClose }: { request: ClassLeaveRequest; approve: boolean; by: string; onClose: () => void }) {
  const decideLeave = useStudentAdminStore((s) => s.decideLeave);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!approve && !note.trim()) return setError("Tell the student and guardian why the leave is rejected.");
    decideLeave(request, "Class teacher", approve, note.trim(), by);
    toast(approve ? "Recommended to the office" : "Leave rejected", { description: `${request.student.name} · ${formatDate(request.from)}` });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={approve ? "Recommend this leave?" : "Reject this leave?"}
      description={`${request.student.name} · ${LEAVE_TYPES[request.type]} · ${formatDate(request.from)}${request.to !== request.from ? ` → ${formatDate(request.to)}` : ""}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={approve ? "primary" : "danger"} onClick={submit}>
            {approve ? "Recommend" : "Reject"}
          </Button>
        </>
      }
    >
      <FormField label={approve ? "Note for the office" : "Reason"} required={!approve} error={error} hint={approve ? "e.g. guardian confirmed by phone." : undefined}>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} invalid={Boolean(error)} autoFocus />
      </FormField>
    </Dialog>
  );
}
