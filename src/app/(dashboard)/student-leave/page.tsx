import type { Metadata } from "next";

import { StudentLeaveView } from "@/features/students/components/StudentLeaveView";

export const metadata: Metadata = { title: "Student Leave" };

export default function StudentLeavePage() {
  return <StudentLeaveView />;
}
