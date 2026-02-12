"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/currentUser";

const ROLE_MESSAGES: Record<string, string> = {
  learner: "Your learning readiness and progress at a glance.",
  manager: "Monitor your team learners, course completion, and certificates.",
  instructor: "Manage your courses, assessments, and learners.",
  admin: "System-wide visibility over users, courses, and activity.",
};

export default function DashboardWelcome() {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const sync = () => {
      const user = getCurrentUser();
      setUserName(user?.name ?? "there");
      setRole(user?.role ?? "learner");
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const message = ROLE_MESSAGES[role] ?? ROLE_MESSAGES.learner;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 border border-teal-700/50 shadow-xl shadow-teal-900/20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 rounded-full -ml-24 -mb-24" />
      </div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
          Hey, {userName} 👋
        </h2>
        <p className="text-teal-100 text-sm">{message}</p>
      </div>
    </div>
  );
}
