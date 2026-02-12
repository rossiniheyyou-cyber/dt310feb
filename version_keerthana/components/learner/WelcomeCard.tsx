"use client";

import { useState, useEffect } from "react";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { getCurrentUser } from "@/lib/currentUser";

export default function WelcomeCard() {
  const { getReadinessScore } = useLearnerProgress();
  const { score, status } = getReadinessScore();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const syncName = () => {
      const user = getCurrentUser();
      setUserName(user?.name ?? "there");
    };
    syncName();
    window.addEventListener("storage", syncName);
    return () => window.removeEventListener("storage", syncName);
  }, []);

  const statusMessage =
    status === "On Track"
      ? "You're on track for your role"
      : status === "Needs Attention"
      ? "Focus on completing mandatory courses"
      : "Prioritize overdue courses and assignments";

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 border border-teal-700/50 shadow-xl shadow-teal-900/20 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 rounded-full -ml-24 -mb-24"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
              Welcome back, {userName} 👋
            </h2>
            <p className="text-teal-100 mt-2 text-base">
              Your learning readiness is at <span className="font-semibold text-white">{score}%</span> — {statusMessage}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            status === "On Track" ? "bg-teal-500/30 text-white" :
            status === "Needs Attention" ? "bg-yellow-500/30 text-yellow-100" :
            "bg-red-500/30 text-red-100"
          }`}>
            <span className="text-sm font-semibold">{status}</span>
          </div>
        </div>
        <p className="text-sm text-teal-200/80 italic">
          Keep pushing — consistency beats intensity
        </p>
      </div>
    </div>
  );
}
