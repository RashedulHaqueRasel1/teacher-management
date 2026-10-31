import type { Metadata } from "next";

import { MyStudentsView } from "@/features/students/components/MyStudentsView";

export const metadata: Metadata = { title: "My Students" };

export default function StudentsPage() {
  return <MyStudentsView />;
}
