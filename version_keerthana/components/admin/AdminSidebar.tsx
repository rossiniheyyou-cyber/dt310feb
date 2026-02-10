"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  BarChart3,
  Settings,
  Shield,
  Calendar,
  Bell,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Requests", href: "/dashboard/admin/requests", icon: Users },
  { label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { label: "Course Oversight", href: "/dashboard/admin/courses", icon: BookOpen },
  { label: "Assignments & Quizzes", href: "/dashboard/admin/assessments", icon: ClipboardList },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Certificates", href: "/dashboard/admin/certificates", icon: Award },
  { label: "Reports & Analytics", href: "/dashboard/admin/reports", icon: BarChart3 },
  { label: "System Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-teal-900 via-teal-900 to-teal-950 border-r border-teal-800/50 p-6 hidden md:block shadow-lg overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Admin
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
      </div>

      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/30"
                  : "text-teal-100 hover:bg-teal-800/60 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`font-medium ${isActive ? 'text-white' : 'text-teal-200'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
