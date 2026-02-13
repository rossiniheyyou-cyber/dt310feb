"use client";

import { usePathname } from "next/navigation";
import RoleBasedSidebar from "@/components/dashboard/RoleBasedSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCalendar = pathname === "/dashboard/calendar";
  const isNotifications = pathname === "/dashboard/notifications";
  const isUnderRole =
    pathname?.startsWith("/dashboard/learner") ||
    pathname?.startsWith("/dashboard/instructor") ||
    pathname?.startsWith("/dashboard/manager") ||
    pathname?.startsWith("/dashboard/admin");

  if (isCalendar || isNotifications) {
    return (
      <div className="flex min-h-screen">
        <RoleBasedSidebar />
        <main className="flex-1 ml-64 min-w-0 p-8 bg-slate-50">{children}</main>
      </div>
    );
  }

  return <>{children}</>;
}
