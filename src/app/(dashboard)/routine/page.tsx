import type { Metadata } from "next";

import { RoutineView } from "@/features/routine/components/RoutineView";

export const metadata: Metadata = { title: "Class Routine" };

export default function RoutinePage() {
  return <RoutineView />;
}
