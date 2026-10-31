"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useTeacherAdminStore } from "@/features/teachers/store/teacher-admin.store";
import type { Teacher } from "@/features/teachers/types/types";
import { toast } from "@/store/toast.store";

/**
 * Change the portal password. The demo only records when it changed —
 * passwords are never stored in the browser.
 * BACKEND: POST /me/password { currentPassword, newPassword }
 */
export function ChangePasswordDialog({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const updateAccount = useTeacherAdminStore((s) => s.updateAccount);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function save() {
    const e: Record<string, string> = {};
    if (!current) e.current = "Enter your current password.";
    if (next.length < 8 || !/\d/.test(next) || !/[a-zA-Z]/.test(next)) e.next = "Use at least 8 characters with letters and numbers.";
    else if (next === current) e.next = "Choose a password you haven't used here.";
    if (confirm !== next) e.confirm = "Passwords don't match.";
    setErrors(e);
    if (Object.keys(e).length) return;
    updateAccount(teacher.id, { passwordChangedAt: new Date().toISOString(), mustChangePassword: false }, "Password changed", "From the teacher portal", teacher.name);
    toast("Password changed", { description: "Use the new password next time you sign in." });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Change password"
      icon={
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <KeyRound className="h-5 w-5" />
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Change password</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Current password" required error={errors.current}>
          <Input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} invalid={Boolean(errors.current)} />
        </FormField>
        <FormField label="New password" required error={errors.next} hint="At least 8 characters with letters and numbers.">
          <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} invalid={Boolean(errors.next)} />
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirm}>
          <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={Boolean(errors.confirm)} />
        </FormField>
      </div>
    </Dialog>
  );
}
