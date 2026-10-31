import type { Metadata } from "next";

import { MyLeaveView } from "@/features/leave/components/MyLeaveView";

export const metadata: Metadata = { title: "My Leave" };

export default function LeavePage() {
  return <MyLeaveView />;
}
