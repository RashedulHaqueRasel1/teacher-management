import type { Metadata } from "next";

import { MarkEntryView } from "@/features/results/components/MarkEntryView";

export const metadata: Metadata = { title: "Marks Entry" };

export default function MarksPage() {
  return <MarkEntryView />;
}
