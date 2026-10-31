import type { Metadata } from "next";

import { MyClassesView } from "@/features/classes/components/MyClassesView";

export const metadata: Metadata = { title: "My Classes" };

export default function ClassesPage() {
  return <MyClassesView />;
}
