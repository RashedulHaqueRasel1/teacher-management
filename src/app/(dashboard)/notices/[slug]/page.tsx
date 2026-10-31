import type { Metadata } from "next";

import { NoticeReadView } from "@/features/notices/components/NoticeReadView";

export const metadata: Metadata = { title: "Notice" };

export const instant = false;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NoticeReadView slug={slug} />;
}
