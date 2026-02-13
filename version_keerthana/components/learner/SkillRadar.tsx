"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const skillData = [
  { skill: "Frontend", current: 70, required: 80 },
  { skill: "Backend", current: 85, required: 80 },
  { skill: "DSA", current: 78, required: 75 },
  { skill: "Databases", current: 60, required: 70 },
  { skill: "Cloud", current: 35, required: 65 },
];

export default function SkillRadar() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Skill-wise Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" stroke="#334155" />
              <PolarRadiusAxis stroke="#64748b" />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#0fa8a8"
                fill="#0fa8a8"
                fillOpacity={0.4}
              />
              <Radar
                name="Required"
                dataKey="required"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 text-slate-700">
          <p>📌 <strong>Skill Gap Insights</strong></p>
          <p>• Strong in Backend & DSA</p>
          <p>• Databases need more practice</p>
          <p>• Cloud fundamentals need improvement</p>

          <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            View Recommended Courses
          </button>
        </div>
      </div>
    </div>
  );
}
