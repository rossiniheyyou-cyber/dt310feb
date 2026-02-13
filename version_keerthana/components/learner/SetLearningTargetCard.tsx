"use client";

import Link from "next/link";
import { Target, BarChart3, PieChart, Layout } from "lucide-react";

interface SetLearningTargetCardProps {
  onSetTarget: () => void;
}

/**
 * Prominent card (image style) shown when user hasn't set their learning target.
 * "You haven't set a target yet" - blocks AI learning path until fixed.
 */
export default function SetLearningTargetCard({ onSetTarget }: SetLearningTargetCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Illustration area (left) - abstract data/person visualization */}
        <div className="sm:w-48 flex-shrink-0 p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-teal-50/30 flex items-center justify-center">
          <div className="relative w-full max-w-[180px] aspect-square">
            <div className="absolute top-0 left-0 w-14 h-14 rounded-lg bg-slate-200/80 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div className="absolute top-0 right-4 w-16 h-16 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center shadow-sm">
              <Layout className="w-7 h-7 text-teal-600" />
            </div>
            <div className="absolute bottom-4 left-2 w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-teal-700" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-teal-100/80 flex items-center justify-center">
              <Target className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Content (right) */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            You haven&apos;t set a target yet
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Tell us what you do and what you want to be. Select a target role and set your learning goals.
            The AI will build your personalized learning path based on this.{" "}
            <Link
              href="/dashboard/learner/settings"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              How it works?
            </Link>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onSetTarget}
              className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            >
              Set learning target
            </button>
            <Link
              href="/dashboard/learner/settings"
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Change in Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
