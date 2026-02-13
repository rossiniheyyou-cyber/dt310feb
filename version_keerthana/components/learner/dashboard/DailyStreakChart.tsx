"use client";

import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";
import { DASHBOARD_CHART_PALETTE } from "@/lib/tealPalette";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export default function DailyStreakChart() {
  const { data } = useLearnerProgressPage();
  const dailyActivity = data?.timeActivity?.dailyActivity ?? [];
  const totalHours = data?.timeActivity?.totalHoursThisWeek ?? 0;

  const chartData = dailyActivity.map((d, i) => ({
    day: d.day,
    hours: d.hours,
    fill: DASHBOARD_CHART_PALETTE[i % DASHBOARD_CHART_PALETTE.length],
  }));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Daily Streak
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">{totalHours}h</p>
          <p className="text-xs text-slate-500">Total this week</p>
        </div>
      </div>
      <div className="h-[160px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "linear-gradient(135deg, #fff 0%, #f0fdfa 100%)",
                  border: "1px solid #14b8a6",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(13, 148, 136, 0.15)",
                }}
                formatter={(value: number) => [`${value} hours`, "Learning time"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="hours"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                isAnimationActive
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Start learning to see your weekly activity
          </div>
        )}
      </div>
    </div>
  );
}
