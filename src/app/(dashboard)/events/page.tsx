import type { Metadata } from "next";

import { EventsBoardView } from "@/features/events/components/EventsBoardView";

export const metadata: Metadata = { title: "Events & Holidays" };

export default function EventsPage() {
  return <EventsBoardView />;
}
