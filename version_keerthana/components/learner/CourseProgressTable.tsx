"use client";

const courses = [
  {
    name: "Full Stack",
    progress: "68%",
    assignments: "5/7",
    quizzes: "3/5",
    status: "In Progress",
  },
  {
    name: "DSA",
    progress: "82%",
    assignments: "4/5",
    quizzes: "4/4",
    status: "In Progress",
  },
  {
    name: "Cloud",
    progress: "10%",
    assignments: "0/4",
    quizzes: "0/3",
    status: "Not Started",
  },
];

export default function CourseProgressTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Section Title */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Course Progress
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 text-sm font-semibold text-slate-700">
                Course
              </th>
              <th className="text-left py-3 text-sm font-semibold text-slate-700">
                Progress
              </th>
              <th className="text-left py-3 text-sm font-semibold text-slate-700">
                Assignments
              </th>
              <th className="text-left py-3 text-sm font-semibold text-slate-700">
                Quizzes
              </th>
              <th className="text-left py-3 text-sm font-semibold text-slate-700">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.name}
                className="border-b last:border-none hover:bg-slate-50 transition"
              >
                <td className="py-3 text-sm text-slate-800 font-medium">
                  {course.name}
                </td>
                <td className="py-3 text-sm text-slate-700">
                  {course.progress}
                </td>
                <td className="py-3 text-sm text-slate-700">
                  {course.assignments}
                </td>
                <td className="py-3 text-sm text-slate-700">
                  {course.quizzes}
                </td>
                <td className="py-3 text-sm font-medium">
                  {course.status === "In Progress" && (
                    <span className="text-teal-600">
                      {course.status}
                    </span>
                  )}
                  {course.status === "Not Started" && (
                    <span className="text-slate-500">
                      {course.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
