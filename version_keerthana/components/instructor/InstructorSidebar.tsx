"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  BarChart3,
  Calendar,
  Bell,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard/instructor", icon: LayoutDashboard },
  { label: "Courses", href: "/dashboard/instructor/courses", icon: BookOpen },
  { label: "Assessments", href: "/dashboard/instructor/assessments", icon: ClipboardList },
  { label: "Learners", href: "/dashboard/instructor/learners", icon: Users },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Reports", href: "/dashboard/instructor/reports", icon: BarChart3 },
];

export default function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-teal-900 via-teal-900 to-teal-950 border-r border-teal-800/50 p-6 hidden md:block shadow-lg overflow-y-auto z-50">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Instructor
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
      </div>

      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard/instructor" && pathname.startsWith(item.href));
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
