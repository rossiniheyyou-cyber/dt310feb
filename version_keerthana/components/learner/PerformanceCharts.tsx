"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

const quizTrend = [
  { week: "W1", score: 60 },
  { week: "W2", score: 72 },
  { week: "W3", score: 78 },
  { week: "W4", score: 82 },
];

const learningTime = [
  { week: "W1", hours: 4 },
  { week: "W2", hours: 6 },
  { week: "W3", hours: 7 },
  { week: "W4", hours: 7 },
];

export default function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quiz Performance */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          Quiz Performance
        </h3>

        <LineChart width={320} height={220} data={quizTrend}>
          <XAxis
            dataKey="week"
            stroke="#475569"   // slate-600
          />
          <YAxis stroke="#475569" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"  // indigo-500
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </div>

      {/* Learning Time */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          Learning Time / Week
        </h3>

        <BarChart width={320} height={220} data={learningTime}>
          <XAxis
            dataKey="week"
            stroke="#475569"
          />
          <YAxis stroke="#475569" />
          <Bar
            dataKey="hours"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </div>
    </div>
  );
}

