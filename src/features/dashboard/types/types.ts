import type { BadgeTone } from "@/components/ui/badge";

export type SchoolEvent = {
  id: string;
  title: string;
  time: string;
  day: string;
  month: string;
  type: "Event" | "Holiday" | "Exam";
};

export type Notice = {
  id: string;
  title: string;
  audience: string;
  postedAt: string;
  category: { label: string; tone: BadgeTone };
  /** Link to the full notice. */
  href?: string;
};
