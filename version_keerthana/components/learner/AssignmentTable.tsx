import Link from "next/link";
import AssignmentStatusBadge from "./AssignmentStatusBadge";

const assignments = [
  {
    id: "1",
    title: "Build REST API",
    course: "Backend",
    skill: "Backend",
    difficulty: "Medium",
    due: "20 Sep 2024",
    status: "Pending",
  },
  {
    id: "2",
    title: "Binary Tree Traversal",
    course: "DSA",
    skill: "DSA",
    difficulty: "Hard",
    due: "18 Sep 2024",
    status: "Reviewed",
  },
];

export default function AssignmentTable() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left">Assignment</th>
            <th>Course</th>
            <th>Difficulty</th>
            <th>Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="px-4 py-3 font-medium text-slate-800">
                {a.title}
              </td>
              <td>{a.course}</td>
              <td>{a.difficulty}</td>
              <td>{a.due}</td>
              <td>
                <AssignmentStatusBadge status={a.status} />
              </td>
              <td className="pr-4">
                <Link
                  href={`/dashboard/learner/assignments/${a.id}`}
                  className="text-teal-600 font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
