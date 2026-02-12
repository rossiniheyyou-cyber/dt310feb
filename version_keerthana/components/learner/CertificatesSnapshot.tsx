"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { Award, Lock, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function CertificatesSnapshot() {
  const { state } = useLearnerProgress();

  const earned = state.certificates ?? [];
  const recentEarned = earned.slice(0, 2);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Certifications & Achievements
      </h3>

      {recentEarned.length > 0 ? (
        <div className="space-y-3 mb-4">
          {recentEarned.map((c) => (
            <div
              key={`${c.pathSlug}-${c.courseId}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 border border-teal-100"
            >
              <Award size={24} className="text-teal-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{c.courseTitle}</p>
                <p className="text-xs text-slate-500">
                  Earned {formatDate(c.earnedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <Lock size={24} className="text-slate-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              Complete courses to earn certificates
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificates unlock after course completion
            </p>
          </div>
        </div>
      )}

      <Link
        href="/dashboard/learner/certificates"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        View All Certificates <ChevronRight size={16} />
      </Link>
    </div>
  );
}
