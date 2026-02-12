"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/currentUser";
import AdminSidebar from "@/components/admin/AdminSidebar";
import InstructorSidebar from "@/components/instructor/InstructorSidebar";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import LearnerSidebar from "@/components/learner/LearnerSidebar";
import { LearnerProgressProvider } from "@/context/LearnerProgressContext";

export default function RoleBasedSidebar() {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const user = getCurrentUser();
    setRole(user?.role ?? null);
  }, [mounted]);

  if (!mounted || !role) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-teal-900 to-teal-950 border-r border-teal-800/50 p-6 hidden md:block animate-pulse" />
    );
  }

  if (role === "admin") return <AdminSidebar />;
  if (role === "instructor") return <InstructorSidebar />;
  if (role === "manager") return <ManagerSidebar />;
  if (role === "learner") {
    return (
      <LearnerProgressProvider>
        <LearnerSidebar />
      </LearnerProgressProvider>
    );
  }

  return <LearnerSidebar />;
}
