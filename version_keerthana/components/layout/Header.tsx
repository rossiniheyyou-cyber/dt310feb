"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clearCurrentUser, getCurrentUser } from "@/lib/currentUser";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/" || pathname.startsWith("/auth");
  const isInstructor = pathname?.startsWith("/dashboard/instructor");
  const isLearner = pathname?.startsWith("/dashboard/learner");
  const isAdmin = pathname?.startsWith("/dashboard/admin");
  const isManager = pathname?.startsWith("/dashboard/manager");
  const showProfileDropdown = isInstructor || isLearner || isAdmin || isManager;
  const homeHref = isInstructor
    ? "/dashboard/instructor"
    : isLearner
      ? "/dashboard/learner"
      : isAdmin
        ? "/dashboard/admin"
        : isManager
          ? "/dashboard/manager"
          : "/";

  // Prevent hydration mismatch by only rendering icons after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (mounted) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mounted]);

  const handleLogout = () => {
    clearCurrentUser();
    setProfileOpen(false);
    router.push("/auth/login");
  };

  const user = getCurrentUser();
  const displayName = user?.name ?? "User";

  if (isAuthPage) return null;

  return (
    <header className="bg-white border-b border-teal-100 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href={homeHref} className="flex items-center">
          <Image
            src="/logo.png"
            alt="DigitalT3 - Bringing Digital & AI Together"
            width={isAuthPage ? 180 : 40}
            height={isAuthPage ? 48 : 40}
            className={isAuthPage ? "h-12 w-auto" : "h-10 w-auto"}
            style={{ height: "auto" }}
            priority
          />
        </Link>

        {!isAuthPage && mounted && (
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            {showProfileDropdown ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-teal-500 overflow-hidden"
                  aria-label="Profile menu"
                >
                  <Image src="/profile-settings-icon.png" alt="Profile settings" width={40} height={40} className="object-contain w-10 h-10" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 py-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[180px] z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email ?? ""}</p>
                      {user?.professionalTitle && (
                        <p
                          className={`text-xs font-medium mt-1 truncate ${
                            user.professionalTitle === "Senior Fullstack Developer"
                              ? "text-teal-800"
                              : "text-slate-600"
                          }`}
                        >
                          {user.professionalTitle}
                        </p>
                      )}
                    </div>
                    <Link
                      href={
                        isInstructor
                          ? "/dashboard/instructor/settings"
                          : isLearner
                            ? "/dashboard/learner/settings"
                            : isAdmin
                              ? "/dashboard/admin/settings"
                              : "/dashboard/manager/settings"
                      }
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
