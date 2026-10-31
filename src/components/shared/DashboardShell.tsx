"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { HolidaySync } from "@/features/events/components/HolidaySync";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

import { ConfirmHost } from "./ConfirmHost";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/** Sidebar + header frame shared by every teacher page. Signed-out visitors go to /login. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const { hydrated, teacher } = useCurrentTeacher();
  const router = useRouter();
  // TODO (backend phase): proxy.ts redirects on the server once NextAuth is in place.
  useEffect(() => {
    if (hydrated && !teacher) router.replace("/login");
  }, [hydrated, teacher, router]);

  return (
    <div className="min-h-screen bg-canvas">
      <HolidaySync />
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-20" : "lg:pl-68",
          "print:pl-0",
        )}
      >
        <Header />
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          {/* Pages render their own skeleton until the teacher is loaded (keeps instant navigation). */}
          {children}
        </main>
        <Suspense fallback={null}>
          <ConfirmHost />
        </Suspense>
      </div>
    </div>
  );
}
