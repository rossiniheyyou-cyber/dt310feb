"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  BarChart3,
} from "lucide-react";
import { instructorLearners, ROLES } from "@/data/instructorData";

function getStatusBadge(status: string) {
  switch (status) {
    case "excelling":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <TrendingUp className="w-3 h-3" />
          Excelling
        </span>
      );
    case "on_track":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
          <CheckCircle2 className="w-3 h-3" />
          On Track
        </span>
      );
    case "at_risk":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3" />
          At Risk
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {status}
        </span>
      );
  }
}

function getReadinessColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-teal-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export default function InstructorLearnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLearners = instructorLearners.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || l.role === roleFilter;
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Learners</h1>
        <p className="text-slate-500 mt-1">View assigned learners and their progress</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search learners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="excelling">Excelling</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
        </select>
      </div>

      {/* Learner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLearners.map((learner) => (
          <Link
            key={learner.id}
            href={`/dashboard/instructor/learners/${learner.id}`}
            className="rounded-2xl card-gradient border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                  {learner.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800 group-hover:text-teal-600">{learner.name}</p>
                  <p className="text-sm text-slate-500 truncate max-w-[160px]">{learner.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0" />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]" title={learner.role}>
                  {learner.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Courses</span>
                <span className="text-sm font-medium text-slate-700">
                  {learner.completedCourses} / {learner.enrolledCourses} completed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Readiness</span>
                <span className={`text-sm font-bold ${getReadinessColor(learner.readinessScore)}`}>
                  {learner.readinessScore}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {getStatusBadge(learner.status)}
              <span className="text-xs text-slate-400">
                Active {learner.lastActive}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredLearners.length === 0 && (
        <div className="rounded-2xl card-gradient border border-slate-200 p-12 text-center shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No learners match your filters</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <h2 className="font-semibold text-slate-800 mb-4">Learner Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
            <p className="text-2xl font-bold text-teal-700">
              {instructorLearners.filter((l) => l.status === "on_track").length}
            </p>
            <p className="text-sm text-teal-600">On Track</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-700">
              {instructorLearners.filter((l) => l.status === "excelling").length}
            </p>
            <p className="text-sm text-emerald-600">Excelling</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-2xl font-bold text-red-700">
              {instructorLearners.filter((l) => l.status === "at_risk").length}
            </p>
            <p className="text-sm text-red-600">At Risk</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-2xl font-bold text-slate-700">{instructorLearners.length}</p>
            <p className="text-sm text-slate-600">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
