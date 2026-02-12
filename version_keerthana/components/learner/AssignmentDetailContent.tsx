"use client";

import { FileText, BookOpen, ListChecks } from "lucide-react";
import type { Assignment } from "@/data/assignments";

type Props = {
  assignment: Assignment;
};

export default function AssignmentDetailContent({ assignment }: Props) {
  return (
    <div className="space-y-6">
      {assignment.description && (
        <section className="card">
          <h3 className="section-title flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </h3>
          <p className="text-slate-700">{assignment.description}</p>
        </section>
      )}

      {assignment.instructions && assignment.instructions.length > 0 && (
        <section className="card">
          <h3 className="section-title">Instructions</h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-700">
            {assignment.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </section>
      )}

      {assignment.deliverables && assignment.deliverables.length > 0 && (
        <section className="card">
          <h3 className="section-title">Deliverables</h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            {assignment.deliverables.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      {assignment.rubrics && assignment.rubrics.length > 0 && (
        <section className="card">
          <h3 className="section-title flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Rubrics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-700">
                    Criterion
                  </th>
                  <th className="text-right py-2 font-medium text-slate-700">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignment.rubrics.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{r.criterion}</td>
                    <td className="py-2 text-right text-slate-700">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {assignment.referenceMaterials &&
        assignment.referenceMaterials.length > 0 && (
          <section className="card">
            <h3 className="section-title flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reference Materials
            </h3>
            <ul className="space-y-2 text-slate-700">
              {assignment.referenceMaterials.map((m, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-teal-600">•</span>
                  {m.url ? (
                    <a
                      href={m.url}
                      className="text-teal-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.label}
                    </a>
                  ) : (
                    <span>{m.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

      {assignment.submissionGuidelines && (
        <section className="card">
          <h3 className="section-title">Submission Guidelines</h3>
          <p className="text-slate-700">{assignment.submissionGuidelines}</p>
          {assignment.dueDate && (
            <p className="mt-2 text-sm text-slate-600">
              Deadline: {assignment.dueDate}
            </p>
          )}
          {assignment.latePenalty && (
            <p className="text-sm text-slate-600">
              Late penalty: {assignment.latePenalty}
            </p>
          )}
        </section>
      )}

      {assignment.type === "Quiz" && (
        <section className="card bg-teal-50/50 border-teal-200">
          <h3 className="section-title">Quiz Details</h3>
          <div className="flex gap-6 text-sm text-slate-700">
            {assignment.timeLimitMinutes && (
              <p>Time limit: {assignment.timeLimitMinutes} minutes</p>
            )}
            {assignment.attemptLimit && (
              <p>Attempts allowed: {assignment.attemptLimit}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
