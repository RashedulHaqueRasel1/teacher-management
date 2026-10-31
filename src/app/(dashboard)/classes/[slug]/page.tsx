import type { Metadata } from "next";

import { SectionDetailView } from "@/features/classes/components/SectionDetailView";

export const metadata: Metadata = { title: "Class" };

// The section is loaded on the client (demo store / API), so this route may block on `params`.
export const instant = false;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SectionDetailView slug={slug} />;
}
