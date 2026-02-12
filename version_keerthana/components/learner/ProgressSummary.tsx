"use client";

import { PieChart, Pie, Cell } from "recharts";
import { progressSummary, metrics } from "@/data/learnerProgress";

export default function ProgressSummary() {
  const data = [
    { name: "Completed", value: progressSummary.readiness },
    { name: "Remaining", value: 100 - progressSummary.readiness },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">Overall Readiness</h2>
        <div className="flex items-center gap-6">
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
            >
              <Cell fill="#4f46e5" />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>

          <div>
            <p className="text-3xl font-bold text-slate-800">
              {progressSummary.readiness}%
            </p>
            <p className="text-slate-600">
              Target: {progressSummary.targetRole}
            </p>
            <span className="text-emerald-600 font-medium">
              {progressSummary.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white p-4 rounded-xl border text-center"
          >
            <p className="text-xl font-bold text-slate-800">{m.value}</p>
            <p className="text-sm text-slate-600">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
