"use client";

import Link from "next/link";
import { ArrowLeft, Megaphone, Paperclip, Printer } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime, formatFileSize } from "@/features/admissions/utils";
import { cn } from "@/lib/utils";

import { useNotices } from "../hooks/use-notices";
import { CATEGORY_STYLE, audienceLabel, noticePrintHref } from "../utils";

/** One published notice. */
export function NoticeReadView({ slug }: { slug: string }) {
  const { notices, hydrated } = useNotices();
  const notice = notices.find((n) => n.slug === slug && n.status === "published");

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-soft" aria-busy="true" />;
  if (!notice) {
    return (
      <Card>
        <EmptyState
          icon={Megaphone}
          title="Notice not found"
          description="It may have expired or been withdrawn by the office."
          action={
            <Link href="/notices" className={buttonStyles({ variant: "outline" })}>
              <ArrowLeft className="h-4 w-4" />
              All notices
            </Link>
          }
        />
      </Card>
    );
  }

  const style = CATEGORY_STYLE[notice.category];
  const Icon = style.icon;

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/notices" className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition hover:text-fg">
          <ArrowLeft className="h-4 w-4" />
          All notices
        </Link>
        <a href={noticePrintHref(notice)} target="_blank" rel="noopener" className={buttonStyles({ variant: "outline", size: "sm" })}>
          <Printer className="h-3.5 w-3.5" />
          Print
        </a>
      </div>

      <Card className="overflow-hidden">
        <div className={cn("h-1.5", style.bar)} />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", style.tile)}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge tone={style.tone}>{notice.category}</Badge>
                {notice.priority !== "normal" && <Badge tone={notice.priority === "urgent" ? "danger" : "warning"}>{notice.priority === "urgent" ? "Urgent" : "Important"}</Badge>}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-fg">{notice.title}</h1>
              <p className="mt-1 text-sm text-fg-muted">
                {formatDateTime(notice.publishAt!)} · {audienceLabel(notice)}
                {notice.expiresOn && ` · until ${formatDate(notice.expiresOn)}`}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-fg-secondary">
            {notice.body.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
          {notice.attachment && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-fg-secondary">
              <Paperclip className="h-4 w-4 text-fg-subtle" />
              {notice.attachment.name} <span className="text-xs text-fg-subtle">{formatFileSize(notice.attachment.size)}</span>
            </p>
          )}
          <p className="mt-8 border-t border-line pt-4 text-xs text-fg-subtle">Issued by {notice.createdBy}</p>
        </div>
      </Card>
    </div>
  );
}
