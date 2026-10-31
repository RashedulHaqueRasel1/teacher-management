import { Suspense } from "react";
import type { Metadata } from "next";

import { ClassRegisterView } from "@/features/attendance/components/ClassRegisterView";

export const metadata: Metadata = { title: "Attendance Register" };

export default function AttendancePage() {
  // Reads ?section= from the URL, so it needs a Suspense boundary (cacheComponents).
  return (
    <Suspense fallback={<div className="h-[480px] animate-pulse rounded-2xl bg-soft" />}>
      <ClassRegisterView />
    </Suspense>
  );
}
