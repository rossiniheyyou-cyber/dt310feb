"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Lock,
  Calendar,
  ExternalLink,
  ChevronDown,
  Download,
} from "lucide-react";
import { certificateProgress } from "@/data/progressData";

function getStatusConfig(status: string) {
  switch (status) {
    case "earned":
      return {
        label: "Earned",
        icon: Award,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        gradientFrom: "from-emerald-50",
        gradientTo: "to-teal-50",
      };
    case "in_progress":
      return {
        label: "In Progress",
        icon: Clock,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        gradientFrom: "from-amber-50",
        gradientTo: "to-orange-50",
      };
    case "locked":
    default:
      return {
        label: "Locked",
        icon: Lock,
        bgColor: "bg-slate-50",
        textColor: "text-slate-500",
        borderColor: "border-slate-200",
        gradientFrom: "from-slate-50",
        gradientTo: "to-slate-100",
      };
  }
}

export default function CertificationProgress() {
  const [filter, setFilter] = useState<string>("all");
  const [expandedCert, setExpandedCert] = useState<string | null>(null);

  const earnedCount = certificateProgress.filter((c) => c.status === "earned").length;
  const inProgressCount = certificateProgress.filter((c) => c.status === "in_progress").length;

  const filteredCerts = certificateProgress.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const filters = [
    { value: "all", label: "All", count: certificateProgress.length },
    { value: "earned", label: "Earned", count: earnedCount },
    { value: "in_progress", label: "In Progress", count: inProgressCount },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Certification Progress</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your certifications and achievements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{earnedCount}</p>
            <p className="text-xs text-slate-500">Earned</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              filter === f.value
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCerts.map((cert) => {
          const statusConfig = getStatusConfig(cert.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedCert === cert.id;

          return (
            <div
              key={cert.id}
              className={`border ${statusConfig.borderColor} rounded-xl overflow-hidden bg-gradient-to-br ${statusConfig.gradientFrom} ${statusConfig.gradientTo}`}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      cert.status === "earned" ? "bg-emerald-100" : "bg-white"
                    }`}
                  >
                    <StatusIcon
                      className={`w-6 h-6 ${
                        cert.status === "earned" ? "text-emerald-600" : statusConfig.textColor
                      }`}
                    />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <h3 className="font-medium text-slate-800 mb-1">{cert.title}</h3>
                <p className="text-sm text-slate-500">{cert.courseName}</p>

                {/* Progress Bar */}
                {cert.status !== "locked" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-800">{cert.progress}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cert.status === "earned" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${cert.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                {cert.earnedDate && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Earned: {new Date(cert.earnedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {cert.expiryDate && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Expandable Requirements */}
              {cert.requirements && cert.requirements.length > 0 && (
                <>
                  <button
                    onClick={() => setExpandedCert(isExpanded ? null : cert.id)}
                    className="w-full px-4 py-2 border-t border-slate-200/50 flex items-center justify-between text-sm text-slate-600 hover:bg-white/50 transition"
                  >
                    <span>Requirements</span>
                    <ChevronDown
                      className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {cert.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          {req.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                          )}
                          <span
                            className={
                              req.completed ? "text-slate-600" : "text-slate-500"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              {cert.status === "earned" && (
                <div className="px-4 pb-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="px-3 py-2 border border-emerald-300 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
