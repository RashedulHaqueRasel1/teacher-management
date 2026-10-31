"use client";

import { useState } from "react";
import { BriefcaseBusiness, Download, Eye, FileText, GraduationCap, HeartPulse, History, ImageIcon, KeyRound, Phone, UserPen, UserRound } from "lucide-react";

import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
import { InfoCard, InfoFields } from "@/components/shared/InfoCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isPreviewable } from "@/features/admissions/documents";
import { StudentAvatar } from "@/features/admissions/components/StudentAvatar";
import type { DocumentFile } from "@/features/admissions/types/types";
import { ageFrom, formatDate, formatDateTime, formatFileSize } from "@/features/admissions/utils";
import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { localToday } from "@/features/students/demoData/profile-data";
import { downloadTeacherDocument, loadTeacherDocument } from "@/features/teachers/files";
import { yearsOfService } from "@/features/teachers/utils";
import { toast } from "@/store/toast.store";

import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { EditContactDialog } from "./EditContactDialog";

/**
 * The teacher's own record. Contact details and password can be changed here;
 * everything else is kept by the office. TODO (backend phase): GET/PATCH /me
 */
export function MyProfileView() {
  const { teacher, account, audit = [], hydrated } = useCurrentTeacher();
  const [previewing, setPreviewing] = useState<DocumentFile | null>(null);
  const [dialog, setDialog] = useState<"contact" | "password" | null>(null);
  if (!hydrated || !teacher || !account) return <div className="h-[480px] animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  const service = yearsOfService(teacher, localToday());

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="My Profile"
        description="Personal and employment details held by the school office."
        actions={
          <>
            <Button variant="outline" onClick={() => setDialog("password")}>
              <KeyRound className="h-4 w-4" />
              Change password
            </Button>
            <Button onClick={() => setDialog("contact")}>
              <UserPen className="h-4 w-4" />
              Update contact
            </Button>
          </>
        }
      />

      <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <StudentAvatar name={teacher.name} photo={teacher.photo} size="xl" className="rounded-2xl bg-emerald-50 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-fg">{teacher.name}</h2>
          <p className="mt-1 text-sm text-fg-muted">
            {teacher.designation} · {teacher.department} · <span className="font-mono">{teacher.id}</span>
          </p>
          <p className="mt-3 text-xs text-fg-subtle">
            Portal username <span className="font-mono font-semibold text-fg-secondary">{account.username}</span> · password changed {formatDate(account.passwordChangedAt.slice(0, 10))}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InfoCard icon={UserRound} title="Personal">
          <InfoFields
            items={[
              ["Full name", teacher.name],
              ["Gender", teacher.gender],
              ["Date of birth", teacher.dateOfBirth ? `${formatDate(teacher.dateOfBirth)} · ${ageFrom(teacher.dateOfBirth)} yrs` : ""],
              ["Blood group", teacher.bloodGroup],
              ["Religion", teacher.religion],
              ["NID", teacher.nid],
            ]}
          />
        </InfoCard>
        <InfoCard icon={Phone} title="Contact">
          <InfoFields
            items={[
              ["Mobile", teacher.phone],
              ["Email", teacher.email],
              ["Present address", teacher.presentAddress],
              ["Permanent address", teacher.permanentAddress],
            ]}
          />
          <div className="mt-5 rounded-xl bg-subtle p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
              <HeartPulse className="h-3.5 w-3.5" />
              Emergency contact
            </p>
            <p className="mt-1.5 text-sm font-medium text-fg">
              {teacher.emergencyContact.name || "—"}
              {teacher.emergencyContact.relation && <span className="font-normal text-fg-muted"> · {teacher.emergencyContact.relation}</span>}
            </p>
            {teacher.emergencyContact.phone && <p className="text-sm text-fg-secondary">{teacher.emergencyContact.phone}</p>}
          </div>
        </InfoCard>
        <InfoCard icon={BriefcaseBusiness} title="Employment">
          <InfoFields
            items={[
              ["Staff ID", teacher.id],
              ["Designation", teacher.designation],
              ["Department", teacher.department],
              ["Employment type", teacher.employmentType],
              ["Joined on", formatDate(teacher.joinedOn)],
              ["Service", `${service} year(s) here + ${teacher.priorExperience} before`],
              ["Shift", teacher.shift],
              ["Subjects", teacher.subjects.join(", ")],
              ["Bank account", teacher.bankAccount],
            ]}
          />
        </InfoCard>
        <InfoCard icon={GraduationCap} title="Qualification">
          <InfoFields
            items={[
              ["Highest degree", teacher.qualification.degree],
              ["Institution", teacher.qualification.institution],
              ["Passing year", teacher.qualification.year],
            ]}
          />
        </InfoCard>
      </div>

      <InfoCard icon={FileText} title="Documents" action={<span className="text-xs text-fg-subtle">{teacher.documents.length} file(s)</span>}>
        {teacher.documents.length === 0 ? (
          <p className="text-sm text-fg-subtle">No documents on file. Hand copies to the office to add them.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {teacher.documents.map((doc) => {
              const Icon = doc.type.startsWith("image/") ? ImageIcon : FileText;
              const download = () => downloadTeacherDocument(doc, teacher).catch(() => toast("Download failed", { tone: "error" }));
              return (
                <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <button type="button" onClick={() => (isPreviewable(doc) ? setPreviewing(doc) : void download())} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-fg hover:text-indigo-600">{doc.name}</span>
                      <span className="block text-xs text-fg-subtle">{formatFileSize(doc.size)}</span>
                    </span>
                  </button>
                  {isPreviewable(doc) && (
                    <button type="button" onClick={() => setPreviewing(doc)} aria-label={`Preview ${doc.name}`} className="rounded-lg p-1.5 text-fg-subtle transition hover:bg-soft hover:text-indigo-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => void download()} aria-label={`Download ${doc.name}`} className="rounded-lg p-1.5 text-fg-subtle transition hover:bg-soft hover:text-indigo-600">
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </InfoCard>

      <InfoCard icon={History} title="Recent activity on your record">
        {audit.length === 0 ? (
          <p className="text-sm text-fg-subtle">No changes yet.</p>
        ) : (
          <ul className="space-y-3">
            {audit.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-col gap-0.5 border-l-2 border-line pl-3 text-sm sm:flex-row sm:items-baseline sm:gap-3">
                <span className="font-medium text-fg">{e.action}</span>
                {e.detail && <span className="text-fg-muted">{e.detail}</span>}
                <span className="text-xs text-fg-subtle sm:ml-auto">
                  {e.by} · {formatDateTime(e.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InfoCard>

      {previewing && (
        <FilePreviewDialog
          fileName={previewing.name}
          description={`${formatFileSize(previewing.size)} · ${teacher.name} · ${teacher.id}`}
          load={() => loadTeacherDocument(previewing, teacher)}
          onClose={() => setPreviewing(null)}
        />
      )}
      {dialog === "contact" && <EditContactDialog teacher={teacher} onClose={() => setDialog(null)} />}
      {dialog === "password" && <ChangePasswordDialog teacher={teacher} onClose={() => setDialog(null)} />}
    </div>
  );
}
