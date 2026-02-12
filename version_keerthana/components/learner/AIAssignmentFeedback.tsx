import type { Assignment } from "@/data/assignments";

type Props = {
  assignment?: Assignment;
};

export default function AIAssignmentFeedback({ assignment }: Props) {
  const hasFeedback = assignment?.aiFeedback?.trim();
  const showSection =
    (assignment?.status === "Reviewed" || assignment?.status === "Submitted") &&
    hasFeedback;

  if (!showSection) return null;

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
      <h3 className="font-semibold text-teal-700 mb-2">AI Feedback</h3>
      <p className="text-slate-700 whitespace-pre-wrap">{assignment!.aiFeedback}</p>
      <p className="mt-2 text-sm text-slate-600">
        Course progress and readiness score are updated when assignments are reviewed.
      </p>
    </div>
  );
}
  