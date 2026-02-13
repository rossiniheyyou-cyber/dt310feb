"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Calendar, Bell, LayoutDashboard, ClipboardList, BookOpen, Award, BookMarked, Library, HelpCircle } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import SidebarToggleSwitch from "./SidebarToggleSwitch";

const menuItems = [
  { label: "Dashboard", href: "/dashboard/learner", icon: LayoutDashboard },
  { label: "Assignments", href: "/dashboard/learner/assignments", icon: ClipboardList },
  { label: "Calendar", href: "/dashboard/learner/calendar", icon: Calendar },
  { label: "Notifications", href: "/dashboard/learner/notifications", icon: Bell },
  { label: "AI Quiz", href: "/dashboard/learner/ai-quiz", icon: HelpCircle },
];

const certificatesItem = { label: "Certificates", href: "/dashboard/learner/certificates", icon: Award };

const coursesSubItems = [
  { label: "My Courses", href: "/dashboard/learner/courses/my-courses", icon: BookMarked },
  { label: "Available Courses", href: "/dashboard/learner/courses/available", icon: Library },
];

export default function LearnerSidebar() {
  const pathname = usePathname();
  const isCoursesSection = pathname?.startsWith("/dashboard/learner/courses");
  const [coursesExpanded, setCoursesExpanded] = useState(isCoursesSection);
  const { isOpen } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-teal-900 via-teal-900 to-teal-950 border-r border-teal-800/50 shadow-lg overflow-y-auto z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "w-64 p-6" : "w-16 p-3"
      }`}
    >
      <div className={`flex ${isOpen ? "items-start justify-between gap-2" : "items-center justify-center"} mb-8`}>
        {isOpen && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">Learner</h2>
            <div className="h-1 w-12 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
          </div>
        )}
        <SidebarToggleSwitch />
      </div>

      <nav className={`space-y-1.5 ${!isOpen ? "hidden" : ""}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                pathname === item.href
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/30"
                  : "text-teal-100 hover:bg-teal-800/60 hover:text-white"
              }`}
            >
              {Icon && <Icon className="w-5 h-5 shrink-0" />}
              <span className={`font-medium ${pathname === item.href ? 'text-white' : 'text-teal-200'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Courses Section with Sub-items */}
        <div className="pt-2">
          <button
            onClick={() => setCoursesExpanded(!coursesExpanded)}
            className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              isCoursesSection
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/30"
                : "text-teal-100 hover:bg-teal-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 shrink-0" />
              <span className={`font-medium ${isCoursesSection ? 'text-white' : 'text-teal-200'}`}>Courses</span>
            </div>
            <div className={`transition-transform duration-200 ${coursesExpanded ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDown size={18} />
            </div>
          </button>
          
          {coursesExpanded && (
            <div className="ml-3 mt-2 space-y-1 border-l-2 border-teal-700/30 pl-3 animate-slide-in">
              {coursesSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      pathname === subItem.href
                        ? "bg-teal-700/80 text-white shadow-sm"
                        : "text-teal-200 hover:bg-teal-800/50 hover:text-white"
                    }`}
                  >
                    {SubIcon && <SubIcon className="w-4 h-4 shrink-0" />}
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates - Last Item */}
        <div className="pt-2">
          <Link
            href={certificatesItem.href}
            className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              pathname === certificatesItem.href
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/30"
                : "text-teal-100 hover:bg-teal-800/60 hover:text-white"
            }`}
          >
            {certificatesItem.icon && (() => { const CertIcon = certificatesItem.icon!; return <CertIcon className="w-5 h-5 shrink-0" />; })()}
            <span className={`font-medium ${pathname === certificatesItem.href ? 'text-white' : 'text-teal-200'}`}>
              {certificatesItem.label}
            </span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
