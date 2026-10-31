"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldGrid, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, uid } from "@/features/admissions/utils";
import { localToday, schoolDaysBetween } from "@/features/students/demoData/profile-data";
import { TEACHER_LEAVE_LABEL } from "@/features/teachers/demoData/mock-data";
import { useTeacherAdminStore } from "@/features/teachers/store/teacher-admin.store";
import type { Teacher, TeacherLeave, TeacherLeaveType, WeekendPlan } from "@/features/teachers/types/types";
import { toast } from "@/store/toast.store";

export type LeaveUsage = { type: TeacherLeaveType; label: string; quota: number; used: number; left: number };

type Props = { teacher: Teacher; usage: LeaveUsage[]; leaves: TeacherLeave[]; weekend: WeekendPlan; onClose: () => void };

/** Teacher applies for leave; it waits for the office's decision. */
export function ApplyLeaveDialog({ teacher, usage, leaves, weekend, onClose }: Props) {
  const addLeave = useTeacherAdminStore((s) => s.addLeave);
  const today = localToday();
  const [type, setType] = useState<TeacherLeaveType>(usage[0]?.type ?? "casual");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const days = to >= from ? schoolDaysBetween(from, to, weekend).length : 0;
  const balance = usage.find((u) => u.type === type);

  function submit() {
    const next: Record<string, string> = {};
    if (from < today) next.from = "Leave can't start in the past — ask the office to record past leave.";
    if (to < from) next.to = "The last day must be on or after the first day.";
    else if (days === 0) next.to = "These dates are all days off.";
    else if (balance && days > balance.left) next.to = `Only ${balance.left} day(s) of ${balance.label.toLowerCase()} left this year.`;
    const clash = leaves.find((l) => (l.status === "pending" || l.status === "approved") && l.from <= to && l.to >= from);
    if (!next.to && clash) next.to = `Overlaps your ${clash.status} leave (${formatDate(clash.from)} → ${formatDate(clash.to)}).`;
    if (reason.trim().length < 5) next.reason = "Give a short reason.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const leave: TeacherLeave = {
      id: `TL-${uid()}`,
      teacherId: teacher.id,
      type,
      from,
      to,
      reason: reason.trim(),
      submittedAt: new Date().toISOString(),
      submittedBy: "Teacher portal",
      status: "pending",
    };
    addLeave(leave, "Leave applied from the teacher portal", teacher.name);
    toast("Leave request sent", { description: `${days} school day(s) · waiting for the office` });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title="Apply for leave"
      description="The office reviews your request and arranges a substitute for your classes."
      icon={
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <CalendarPlus className="h-5 w-5" />
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Send request</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Leave type" required hint={balance ? `${balance.left} of ${balance.quota} day(s) left this year` : "Unpaid / special leave — the office decides."}>
          <Select value={type} onChange={(e) => setType(e.target.value as TeacherLeaveType)}>
            {usage.map((u) => (
              <option key={u.type} value={u.type}>
                {u.label} ({u.left} left)
              </option>
            ))}
            <option value="other">{TEACHER_LEAVE_LABEL.other}</option>
          </Select>
        </FormField>
        <FieldGrid>
          <FormField label="From" required error={errors.from}>
            <Input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} invalid={Boolean(errors.from)} />
          </FormField>
          <FormField label="To" required error={errors.to} hint={days ? `${days} school day(s)` : undefined}>
            <Input type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} invalid={Boolean(errors.to)} />
          </FormField>
        </FieldGrid>
        <FormField label="Reason" required error={errors.reason}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} invalid={Boolean(errors.reason)} placeholder="e.g. Family programme in the home district." />
        </FormField>
      </div>
    </Dialog>
  );
}
