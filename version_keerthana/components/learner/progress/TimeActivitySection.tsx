"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Clock, TrendingUp, Video, FileText, HelpCircle, Download } from "lucide-react";
import { timeActivityData } from "@/data/progressData";

export default function TimeActivitySection() {
  const data = timeActivityData;

  const activityItems = [
    {
      icon: Video,
      label: "Videos Watched",
      value: data.activitySummary.videosWatched,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: FileText,
      label: "Assignments Submitted",
      value: data.activitySummary.assignmentsSubmitted,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: HelpCircle,
      label: "Quizzes Completed",
      value: data.activitySummary.quizzesCompleted,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Download,
      label: "Resources Downloaded",
      value: data.activitySummary.resourcesDownloaded,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Time & Learning Activity</h2>
          <p className="text-sm text-slate-500 mt-1">
            Your learning activity over the past weeks
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-teal-700">This Week</span>
          </div>
          <p className="text-2xl font-bold text-teal-800">{data.totalHoursThisWeek}h</p>
          <p className="text-xs text-teal-600 mt-1">Learning time</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-indigo-700">This Month</span>
          </div>
          <p className="text-2xl font-bold text-indigo-800">{data.totalHoursThisMonth}h</p>
          <p className="text-xs text-indigo-600 mt-1">Learning time</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{data.averageDailyHours}h</p>
          <p className="text-xs text-purple-600 mt-1">Per day</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-700">Trend</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">
            {data.weeklyTrend[data.weeklyTrend.length - 1].hours >
            data.weeklyTrend[data.weeklyTrend.length - 2]?.hours
              ? "↑"
              : "→"}
          </p>
          <p className="text-xs text-orange-600 mt-1">vs last week</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Trend */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Weekly Learning Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyTrend}>
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0d9488" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Daily Activity (This Week)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyActivity}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Activity Summary (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activityItems.map((item) => (
            <div
              key={item.label}
              className={`${item.bgColor} rounded-lg p-4 border border-slate-100`}
            >
              <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
