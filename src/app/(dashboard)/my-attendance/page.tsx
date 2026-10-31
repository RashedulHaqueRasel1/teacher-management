import type { Metadata } from "next";

import { MyAttendanceView } from "@/features/attendance/components/MyAttendanceView";

export const metadata: Metadata = { title: "My Attendance" };

export default function MyAttendancePage() {
  return <MyAttendanceView />;
}
