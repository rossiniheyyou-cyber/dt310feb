"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Plus,
  FileEdit,
  Bell,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  GraduationCap,
} from "lucide-react";
import { instructorKPIs, overdueReviews } from "@/data/instructorData";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";

const kpiCards = [
  {
    label: "Active Courses",
    value: instructorKPIs.activeCourses,
    icon: BookOpen,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    label: "Enrolled Learners",
    value: instructorKPIs.enrolledLearners,
    icon: Users,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    label: "Pending Reviews",
    value: instructorKPIs.pendingReviews,
    icon: ClipboardCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    label: "Learners at Risk",
    value: instructorKPIs.learnersAtRisk,
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

const quickActions = [
  {
    label: "Create Course",
    description: "Add a new role-based course",
    href: "/dashboard/instructor/courses?create=true",
    icon: Plus,
  },
  {
    label: "Create Assessment",
    description: "Assignment or quiz",
    href: "/dashboard/instructor/assessments?create=true",
    icon: ClipboardCheck,
  },
  {
    label: "Review Submissions",
    description: "Pending evaluations",
    href: "/dashboard/instructor/assessments?tab=submissions",
    icon: FileEdit,
  },
];

export default function InstructorDashboard() {
  const [showCoTeacher, setShowCoTeacher] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <DashboardWelcome />

        {/* KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`bg-white border ${kpi.borderColor} rounded-xl p-5 hover:shadow-sm transition`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <span className="text-3xl font-bold text-slate-800">{kpi.value}</span>
              </div>
              <p className="text-sm text-slate-600 mt-3 font-medium">{kpi.label}</p>
            </div>
          );
        })}
        </div>

        {/* Alerts & Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Reviews Alert */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-amber-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-800">Overdue Reviews</h2>
            </div>
            {overdueReviews.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                {overdueReviews.length} overdue
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {overdueReviews.length > 0 ? (
              overdueReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/dashboard/instructor/assessments?review=${review.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition group"
                >
                  <div>
                    <p className="font-medium text-slate-800 group-hover:text-teal-600">
                      {review.assessment}
                    </p>
                    <p className="text-sm text-slate-500">
                      {review.learnerName} • {review.course}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-medium">
                      {review.daysOverdue}d overdue
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
                <p>All reviews are up to date</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition group"
                >
                  <div className="p-2.5 rounded-lg bg-teal-50 group-hover:bg-teal-100">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 group-hover:text-teal-700">
                      {action.label}
                    </p>
                    <p className="text-sm text-slate-500">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </Link>
              );
            })}
          </div>
        </div>
        </div>

        {/* Recent Activity / Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-800 mb-4">At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-50">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">68%</p>
              <p className="text-sm text-slate-500">Average course completion</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">23</p>
              <p className="text-sm text-slate-500">Submissions awaiting review</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">8</p>
              <p className="text-sm text-slate-500">Learners need attention</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
