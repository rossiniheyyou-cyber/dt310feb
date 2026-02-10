"use client";

import { TrendingUp, Award, Target, BookOpen } from "lucide-react";

export default function ProgressIntegrationCard() {
  const items = [
    {
      icon: BookOpen,
      label: "Course progress",
      desc: "Completion updates your course completion percentage",
    },
    {
      icon: Target,
      label: "Readiness score",
      desc: "Affects your overall learning readiness metric",
    },
    {
      icon: TrendingUp,
      label: "Skill proficiency",
      desc: "Improves skill levels in your learning path",
    },
    {
      icon: Award,
      label: "Certification eligibility",
      desc: "Required for certification completion",
    },
  ];

  return (
    <div className="card bg-slate-50 border-slate-200">
      <h3 className="section-title">Progress Integration</h3>
      <p className="text-sm text-slate-600 mb-4">
        Assignment completion affects your overall learning progress:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex gap-3 p-3 rounded-lg bg-white border border-slate-100"
          >
            <Icon className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 text-sm">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
