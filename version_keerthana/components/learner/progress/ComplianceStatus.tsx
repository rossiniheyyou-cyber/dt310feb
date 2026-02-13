"use client";

import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { complianceItems } from "@/data/progressData";

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        icon: CheckCircle2,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
      };
    case "in_progress":
      return {
        label: "In Progress",
        icon: Clock,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      };
    case "overdue":
      return {
        label: "Overdue",
        icon: AlertTriangle,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    case "not_started":
    default:
      return {
        label: "Not Started",
        icon: AlertCircle,
        bgColor: "bg-slate-50",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
      };
  }
}

export default function ComplianceStatus() {
  const completedCount = complianceItems.filter((c) => c.status === "completed").length;
  const inProgressCount = complianceItems.filter((c) => c.status === "in_progress").length;
  const overdueCount = complianceItems.filter((c) => c.status === "overdue").length;
  const totalItems = complianceItems.length;
  const completedItems = complianceItems.filter((c) => c.status === "completed").length;
  const compliancePercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Shield className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Compliance Status</h2>
            <p className="text-sm text-slate-500">Training completion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-600">{compliancePercentage}%</p>
            <p className="text-xs text-slate-500">Compliance Rate</p>
          </div>
          <div className="w-16 h-16">
            <svg className="transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={overdueCount > 0 ? "#ef4444" : "#0d9488"}
                strokeWidth="3"
                strokeDasharray={`${compliancePercentage}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
          <p className="text-xs text-emerald-600">Completed</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
          <p className="text-xs text-blue-600">In Progress</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
          <p className="text-xs text-red-600">Overdue</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <p className="text-2xl font-bold text-slate-700">{totalItems}</p>
          <p className="text-xs text-slate-600">Total Assigned</p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {overdueCount} training{overdueCount > 1 ? "s are" : " is"} overdue
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Complete overdue items immediately to maintain compliance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Items */}
      <div className="space-y-2">
        {complianceItems.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          const StatusIcon = statusConfig.icon;
          const isOverdue = item.status === "overdue";

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isOverdue
                  ? "border-red-200 bg-red-50/50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              } transition`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                <div>
                  <p className={`text-sm font-medium ${isOverdue ? "text-red-800" : "text-slate-800"}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {item.status === "completed" && item.completedDate
                          ? `Completed ${new Date(item.completedDate).toLocaleDateString()}`
                          : `Due ${new Date(item.dueDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
