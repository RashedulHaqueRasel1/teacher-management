"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Fingerprint, LogOut, UserRound, Wallet } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { useCurrentTeacher } from "@/features/auth/hooks/use-current-teacher";
import { useSessionStore } from "@/features/auth/store/session.store";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "My Profile", href: "/profile", icon: UserRound },
  { label: "My Attendance", href: "/my-attendance", icon: Fingerprint },
  { label: "Salary & Payslips", href: "/salary", icon: Wallet },
];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
  const { teacher } = useCurrentTeacher();
  const signOut = useSessionStore((s) => s.signOut);
  const router = useRouter();
  const name = teacher?.name ?? "Teacher";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2.5 rounded-xl p-1 pr-1 transition hover:bg-soft sm:pr-2.5",
          open && "bg-soft",
        )}
      >
        <Avatar name={name} size="md" className="bg-linear-to-br from-emerald-500 to-teal-600 text-white" />
        <div className="hidden whitespace-nowrap text-left sm:block">
          <p className="text-sm font-semibold leading-tight text-fg">{name}</p>
          <p className="text-xs leading-tight text-fg-muted">{teacher?.subjects[0] ?? "Teacher"}</p>
        </div>
        <ChevronDown className={cn("hidden h-4 w-4 text-fg-subtle transition-transform sm:block", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right animate-dropdown overflow-hidden rounded-2xl bg-surface p-1.5 shadow-popover">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <Avatar name={name} size="lg" className="bg-linear-to-br from-emerald-500 to-teal-600 text-white" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">{name}</p>
              <p className="truncate text-xs text-fg-muted">{teacher?.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-soft" />
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg-secondary transition hover:bg-subtle hover:text-fg"
              >
                <Icon className="h-4 w-4 text-fg-subtle" />
                {item.label}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-soft" />
          <button
            type="button"
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
