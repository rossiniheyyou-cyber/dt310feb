"use client";

import { useLearnerDashboard } from "@/context/LearnerDashboardContext";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { DASHBOARD_CHART_PALETTE } from "@/lib/tealPalette";

const SIZE = 140;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ReadinessScoreRing() {
  const { data, loading } = useLearnerDashboard();
  const { state, getReadinessScore } = useLearnerProgress();
  void state; // subscribe for realtime updates
  const localScore = getReadinessScore().score;
  const apiScore = data?.readinessScore ?? 0;
  const score = Math.min(100, Math.max(0, Object.keys(state.courseProgress).length > 0 ? localScore : apiScore));
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  if (loading) {
    return (
      <div className="rounded-2xl card-gradient border border-slate-200 p-6 animate-pulse">
        <div className="flex justify-center">
          <div className="w-[140px] h-[140px] rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-center mb-4">
        Readiness Score
      </h3>
      <div className="flex justify-center relative">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <defs>
            <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={DASHBOARD_CHART_PALETTE[0]} />
              <stop offset="33%" stopColor={DASHBOARD_CHART_PALETTE[1]} />
              <stop offset="66%" stopColor={DASHBOARD_CHART_PALETTE[2]} />
              <stop offset="100%" stopColor={DASHBOARD_CHART_PALETTE[5]} />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#readinessGradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}%</span>
        </div>
      </div>
    </div>
  );
}
