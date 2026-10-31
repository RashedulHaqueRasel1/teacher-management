import type { Metadata } from "next";

import { MySalaryView } from "@/features/salary/components/MySalaryView";

export const metadata: Metadata = { title: "Salary & Payslips" };

export default function SalaryPage() {
  return <MySalaryView />;
}
