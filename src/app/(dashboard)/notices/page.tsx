import type { Metadata } from "next";

import { NoticeBoardView } from "@/features/notices/components/NoticeBoardView";

export const metadata: Metadata = { title: "Notices" };

export default function NoticesPage() {
  return <NoticeBoardView />;
}
