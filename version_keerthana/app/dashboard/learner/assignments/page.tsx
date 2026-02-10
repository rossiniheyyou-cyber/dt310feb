import AssignmentSummaryCards from "@/components/learner/AssignmentSummaryCards";
import AssignmentTimeline from "@/components/learner/AssignmentTimeline";
import AssignmentListing from "@/components/learner/AssignmentListing";
import QuizzesSection from "@/components/learner/QuizzesSection";

export default function AssignmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Assignments & Assessments
        </h1>
        <p className="text-slate-500 mt-1">
          Track, submit, and review assignments and quizzes across your learning paths
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Overview
        </h2>
        <AssignmentSummaryCards />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Timeline
        </h2>
        <AssignmentTimeline />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          All Assignments
        </h2>
        <AssignmentListing />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Quizzes & Assessments
        </h2>
        <QuizzesSection />
      </section>
    </div>
  );
}
