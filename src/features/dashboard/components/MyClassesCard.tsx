import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionCode } from "@/features/classes/demoData/mock-data";
import type { MySection } from "@/features/classes/hooks/use-my-classes";

/** Compact list of the sections the teacher works with. */
export function MyClassesCard({ sections }: { sections: MySection[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>My classes</CardTitle>
          <CardDescription>{sections.length} section{sections.length === 1 ? "" : "s"} this session</CardDescription>
        </div>
        <Link href="/classes" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <ul className="divide-y divide-line px-6 pb-4 pt-2">
        {sections.slice(0, 6).map((s) => (
          <li key={s.key}>
            <Link href={`/classes/${s.slug}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{sectionCode(s.className, s.section)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">
                  {s.className} · {s.section}
                </p>
                <p className="truncate text-xs text-fg-muted">{s.assignments.map((a) => a.subject).join(", ") || "Class teacher"}</p>
              </div>
              {s.isClassTeacher && (
                <Badge tone="warning">
                  <Crown className="h-3 w-3" />
                  Class teacher
                </Badge>
              )}
              <span className="text-xs tabular-nums text-fg-muted">{s.students.length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
