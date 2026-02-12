"use client";

import { useState } from "react";
import {
  Award,
  Download,
  Share2,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import Link from "next/link";

type CertificateWithMeta = {
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  earnedAt: string;
  certificateId: string;
  status: "Issued" | "Revoked";
};

export default function LearnerCertificatesPage() {
  const { state } = useLearnerProgress();
  const [previewCert, setPreviewCert] = useState<CertificateWithMeta | null>(null);
  const earned = (state.certificates ?? []).map((c) => ({
    ...c,
    certificateId: `CERT-${c.pathSlug.toUpperCase()}-${c.courseId}-${c.earnedAt.slice(0, 10).replace(/-/g, "")}`,
    status: "Issued" as const,
  }));

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">
          Certificates earned by completing role-based courses. All mandatory modules, assignments, and quizzes must be completed to earn a certificate.
        </p>
      </div>

      {earned.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">No certificates yet</h2>
          <p className="text-slate-600 mt-2 max-w-md mx-auto">
            Complete all mandatory modules, pass required assignments and quizzes, and finish a course to earn your first certificate.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/learner/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Browse courses
              <ExternalLink size={16} />
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            Tip: Check your progress on the dashboard to see how close you are to the next certificate.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {earned.map((cert) => (
            <div
              key={`${cert.pathSlug}-${cert.courseId}-${cert.earnedAt}`}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-200 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                    cert.status === "Issued" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cert.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mt-3">{cert.courseTitle}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{cert.pathTitle}</p>
              <p className="text-xs text-slate-400 mt-1">
                Role: {cert.pathTitle} • Completed {new Date(cert.earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">ID: {cert.certificateId}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setPreviewCert(cert)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Certificate preview</h3>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <Award className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">{previewCert.courseTitle}</p>
                <p className="text-sm text-slate-600 mt-1">{previewCert.pathTitle}</p>
                <p className="text-xs text-slate-500 mt-2">Certificate of Completion</p>
                <p className="text-xs font-mono text-slate-400 mt-1">{previewCert.certificateId}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Completed on {new Date(previewCert.earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Share2 size={16} />
                Share (LinkedIn)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
