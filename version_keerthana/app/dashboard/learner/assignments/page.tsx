import AssignmentSummaryCards from "@/components/learner/AssignmentSummaryCards";
import AssignmentListing from "@/components/learner/AssignmentListing";

export default function AssignmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Assessments
        </h1>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Overview
        </h2>
        <AssignmentSummaryCards />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Assessments
        </h2>
        <AssignmentListing />
      </section>
    </div>
  );
}
