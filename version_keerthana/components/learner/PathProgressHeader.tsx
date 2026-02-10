"use client";

import { useLearnerProgress } from "@/context/LearnerProgressContext";
import type { LearningPath } from "@/data/learningPaths";

export function PathProgressHeader({ path }: { path: LearningPath }) {
  const { state } = useLearnerProgress();

  const entries = Object.values(state.courseProgress).filter(
    (e) => e.pathSlug === path.slug
  );
  const totalModules = entries.reduce((acc, e) => acc + e.totalModules, 0);
  const completedModules = entries.reduce(
    (acc, e) => acc + e.completedModuleIds.length,
    0
  );
  const progress =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Overall progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full max-w-xs bg-slate-200 rounded-full h-2">
        <div
          className="bg-teal-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
