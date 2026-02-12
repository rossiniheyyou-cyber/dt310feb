"use client";

import { useLearnerProgress } from "@/context/LearnerProgressContext";

export default function ProgressCharts() {
  const { state } = useLearnerProgress();
  const totalHours = Math.round(state.totalLearningHours * 10) / 10;
  const completedCourses = Object.values(state.courseProgress).filter(
    (c) => c.courseCompleted
  ).length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Progress Analytics
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
          <span className="text-slate-700 text-sm">Weekly Learning Time</span>
          <span className="font-semibold text-slate-900">{totalHours}h total</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
          <span className="text-slate-700 text-sm">Courses Completed</span>
          <span className="font-semibold text-slate-900">{completedCourses}</span>
        </div>
      </div>
    </div>
  );
}
  