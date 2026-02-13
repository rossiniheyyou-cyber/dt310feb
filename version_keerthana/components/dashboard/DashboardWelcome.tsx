"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/currentUser";
import RoleHeader from "@/components/shared/RoleHeader";

const ROLE_SUBTITLES: Record<string, string> = {
  learner: "Your learning readiness and progress at a glance.",
  manager: "Monitor your team learners, course completion, and certificates.",
  instructor: "Manage your courses, assessments, and learners.",
  admin: "System-wide visibility over users, courses, and activity.",
};

export default function DashboardWelcome() {
  const [userName, setUserName] = useState("there");
  const [role, setRole] = useState<string>("learner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      const user = getCurrentUser();
      setUserName(user?.name ?? "there");
      setRole(user?.role ?? "learner");
      setLoading(false);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const greeting = `Welcome back, ${userName}`;
  const subtitle = ROLE_SUBTITLES[role] ?? ROLE_SUBTITLES.learner;

  return (
    <RoleHeader
      greeting={greeting}
      subtitle={subtitle}
      loading={loading}
    />
  );
}
