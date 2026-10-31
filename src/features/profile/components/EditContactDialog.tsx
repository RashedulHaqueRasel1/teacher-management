"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldGrid, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizePhone } from "@/features/admissions/utils";
import { useTeacherAdminStore } from "@/features/teachers/store/teacher-admin.store";
import type { Teacher } from "@/features/teachers/types/types";
import { toast } from "@/store/toast.store";

const PHONE = /^01[3-9]\d{8}$/;

/**
 * Teachers keep their own contact details current.
 * BACKEND: PATCH /me { phone, presentAddress, emergencyContact }
 */
export function EditContactDialog({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const updateTeacher = useTeacherAdminStore((s) => s.updateTeacher);
  const [phone, setPhone] = useState(teacher.phone);
  const [address, setAddress] = useState(teacher.presentAddress);
  const [emergency, setEmergency] = useState(teacher.emergencyContact);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function save() {
    const next: Record<string, string> = {};
    if (!PHONE.test(normalizePhone(phone))) next.phone = "Enter an 11-digit Bangladeshi mobile number.";
    if (emergency.phone && !PHONE.test(normalizePhone(emergency.phone))) next.emergencyPhone = "Enter an 11-digit mobile number.";
    if (!address.trim()) next.address = "Present address is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    updateTeacher(
      teacher.id,
      { phone: normalizePhone(phone), presentAddress: address.trim(), emergencyContact: { ...emergency, phone: emergency.phone ? normalizePhone(emergency.phone) : "" } },
      "Contact details updated from the teacher portal",
      teacher.name,
    );
    toast("Contact details saved");
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title="Update contact details"
      description="Name, designation and bank details can only be changed by the office."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Mobile" required error={errors.phone}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" invalid={Boolean(errors.phone)} />
        </FormField>
        <FormField label="Present address" required error={errors.address}>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} invalid={Boolean(errors.address)} className="min-h-20" />
        </FormField>
        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Emergency contact</p>
        <FieldGrid>
          <FormField label="Name">
            <Input value={emergency.name} onChange={(e) => setEmergency({ ...emergency, name: e.target.value })} />
          </FormField>
          <FormField label="Relation">
            <Input value={emergency.relation} onChange={(e) => setEmergency({ ...emergency, relation: e.target.value })} />
          </FormField>
          <FormField label="Phone" error={errors.emergencyPhone}>
            <Input value={emergency.phone} onChange={(e) => setEmergency({ ...emergency, phone: e.target.value })} inputMode="tel" invalid={Boolean(errors.emergencyPhone)} />
          </FormField>
        </FieldGrid>
      </div>
    </Dialog>
  );
}
