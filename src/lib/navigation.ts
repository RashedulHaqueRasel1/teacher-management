import {
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Fingerprint,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MailCheck,
  PenLine,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Sidebar navigation. Add a route here and create `app/(dashboard)/<href>/page.tsx`. */
export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Teaching",
    items: [
      { title: "My Classes", href: "/classes", icon: BookOpen },
      { title: "Class Routine", href: "/routine", icon: CalendarClock },
      { title: "My Students", href: "/students", icon: GraduationCap },
      { title: "Attendance Register", href: "/attendance", icon: CalendarCheck },
      { title: "Marks Entry", href: "/marks", icon: PenLine },
    ],
  },
  {
    label: "Requests",
    items: [
      { title: "Student Leave", href: "/student-leave", icon: MailCheck },
      { title: "My Leave", href: "/leave", icon: CalendarPlus },
    ],
  },
  {
    label: "School",
    items: [
      { title: "Notices", href: "/notices", icon: Megaphone },
      { title: "Events & Holidays", href: "/events", icon: CalendarDays },
    ],
  },
  {
    label: "My Account",
    items: [
      { title: "My Attendance", href: "/my-attendance", icon: Fingerprint },
      { title: "Salary & Payslips", href: "/salary", icon: Wallet },
      { title: "My Profile", href: "/profile", icon: UserRound },
    ],
  },
];

export const allNavItems = navigation.flatMap((group) => group.items);

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Resolve the nav item (and its group label) for the current path. */
export function findNavItem(pathname: string) {
  for (const group of navigation) {
    const item = group.items.find((i) => isActivePath(pathname, i.href));
    if (item) return { ...item, group: group.label };
  }
  return undefined;
}
