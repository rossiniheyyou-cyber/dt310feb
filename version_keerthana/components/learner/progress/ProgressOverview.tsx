"use client";

import {
  BookOpen,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";

function getStatusColor(status: string) {
  switch (status) {
    case "On Track":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Needs Attention":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "At Risk":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "On Track":
      return <TrendingUp className="w-4 h-4" />;
    case "Needs Attention":
      return <AlertTriangle className="w-4 h-4" />;
    case "At Risk":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
}

function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "#0d9488",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
}

const defaultOverview = {
  overallCompletion: 0,
  readinessStatus: "On Track" as const,
  targetRole: "—",
  learningPathProgress: 0,
  totalEnrolledCourses: 0,
  completedCourses: 0,
  totalAssignments: 0,
  completedAssignments: 0,
  totalQuizzes: 0,
  passedQuizzes: 0,
  averageQuizScore: 0,
  totalLearningHours: 0,
  weeklyTarget: 10,
  currentWeekHours: 0,
  currentStreak: 0,
};

export default function ProgressOverview() {
  const { data, loading } = useLearnerProgressPage();
  const overview = data?.overview ?? defaultOverview;

  const metrics = [
    {
      icon: BookOpen,
      label: "Courses Completed",
      value: `${overview.completedCourses} / ${overview.totalEnrolledCourses}`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: CheckCircle2,
      label: "Assignments Done",
      value: `${overview.completedAssignments} / ${overview.totalAssignments}`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Award,
      label: "Avg Quiz Score",
      value: `${overview.averageQuizScore}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      label: "Total Learning Time",
      value: `${overview.totalLearningHours}h`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Progress Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Target Role: {overview.targetRole}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-slate-700">
            {overview.currentStreak} day streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Completion */}
        <div className="flex items-center gap-6">
          <CircularProgress percentage={overview.overallCompletion} />
          <div>
            <p className="text-sm text-slate-500 mb-1">Overall Completion</p>
            <p className="text-3xl font-bold text-slate-800">{overview.overallCompletion}%</p>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(
                overview.readinessStatus
              )}`}
            >
              {getStatusIcon(overview.readinessStatus)}
              {overview.readinessStatus}
            </div>
          </div>
        </div>

        {/* Learning Path Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Learning Path Progress</span>
              <span className="text-sm font-medium text-slate-800">{overview.learningPathProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${overview.learningPathProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Weekly Learning Goal</span>
              <span className="text-sm font-medium text-slate-800">
                {overview.currentWeekHours}h / {overview.weeklyTarget}h
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((overview.currentWeekHours / overview.weeklyTarget) * 100 || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`${metric.bgColor} rounded-lg p-3 border border-slate-100`}
            >
              <metric.icon className={`w-5 h-5 ${metric.color} mb-2`} />
              <p className="text-lg font-bold text-slate-800">{metric.value}</p>
              <p className="text-xs text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
