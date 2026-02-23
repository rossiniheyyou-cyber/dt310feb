"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AssignmentStatusBadge from "@/components/learner/AssignmentStatusBadge";
import AssignmentSubmission from "@/components/learner/AssignmentSubmission";
import AIAssignmentFeedback from "@/components/learner/AIAssignmentFeedback";
import AssignmentDetailContent from "@/components/learner/AssignmentDetailContent";
import ProgressIntegrationCard from "@/components/learner/ProgressIntegrationCard";
import { useLearnerAssignments } from "@/context/LearnerAssignmentsContext";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string)?.replace(/^a-/, "") || "";
  const idWithPrefix = params.id as string;
  const { assignments, refresh, loading } = useLearnerAssignments();
  const assignment = assignments.find(
    (a) => a.id === idWithPrefix || a.id === `a-${id}` || String(a.id) === id
  );

  if (loading) {
    return (
      <div className="max-w-4xl">
        <p className="text-slate-600">Loading…</p>
        <Link href="/dashboard/learner/assignments" className="text-teal-600 font-medium mt-4 inline-block">← Back to Assignments</Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl">
        <p className="text-slate-600">Assignment not found.</p>
        <Link
          href="/dashboard/learner/assignments"
          className="text-teal-600 font-medium mt-4 inline-block"
        >
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  if (assignment.type === "Quiz") {
    router.replace(`/dashboard/learner/quiz/${id}`);
    return null;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/dashboard/learner/assignments"
        className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assignments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {assignment.title}
          </h1>
          <p className="text-slate-500 mt-1">
            {assignment.course} • {assignment.module}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <AssignmentStatusBadge status={assignment.status} />
            <span className="text-sm text-slate-600">
              Role: {assignment.role} • Type: {assignment.type}
            </span>
          </div>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p className="font-medium text-slate-700">Due date</p>
          <p>{assignment.dueDate}</p>
          {assignment.latePenalty && (
            <p className="text-slate-500 mt-1">Late penalty: {assignment.latePenalty}</p>
          )}
        </div>
      </div>

      <AssignmentDetailContent assignment={assignment} />

      <ProgressIntegrationCard />

      <AssignmentSubmission assignment={assignment} onSubmitted={refresh} />
      <AIAssignmentFeedback assignment={assignment} />
    </div>
  );
}
