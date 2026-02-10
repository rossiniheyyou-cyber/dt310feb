export default function AssignmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Assigned: "bg-slate-100 text-slate-700",
    Due: "bg-amber-100 text-amber-700",
    Pending: "bg-amber-100 text-amber-700",
    Submitted: "bg-teal-100 text-teal-700",
    Reviewed: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {status}
    </span>
  );
}
  