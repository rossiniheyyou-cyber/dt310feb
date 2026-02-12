"use client";

export default function CourseFilterBar() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Search courses..."
        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      <select className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700">
        <option>Status</option>
        <option>All</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <select className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700">
        <option>Skill</option>
        <option>Frontend</option>
        <option>Backend</option>
        <option>DSA</option>
        <option>Cloud</option>
      </select>

      <select className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700">
        <option>Level</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>
    </div>
  );
}
