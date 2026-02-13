"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";
import Image from "next/image";

const CHART_COLORS = [
  "#8b5cf6", // purple
  "#ec4899", // magenta/pink
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#f472b6", // light pink
  "#6366f1", // indigo
  "#22d3ee", // teal
  "#a78bfa", // light purple
];

export default function SkillsDistributionCard() {
  const { data } = useLearnerProgressPage();
  const skillProgress = data?.skillProgress ?? [];

  const pieData = skillProgress.map((skill, i) => {
    const progressPct = Math.round((skill.currentLevel / skill.targetLevel) * 100);
    return {
      name: skill.name,
      value: Math.max(progressPct, 5),
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const averageScore =
    skillProgress.length > 0
      ? Math.round(
          skillProgress.reduce((sum, s) => sum + (s.currentLevel / s.targetLevel) * 100, 0) /
            skillProgress.length
        )
      : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 min-h-[340px]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl -ml-24 -mb-24" />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
        <div className="absolute top-[20%] right-[25%] w-1 h-1 rounded-full bg-purple-400/50" />
        <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 rounded-full bg-pink-400/50" />
      </div>

      <div className="relative z-10 p-6 flex flex-col lg:flex-row gap-6 items-center">
        {/* Pie chart area */}
        <div className="flex-1 w-full max-w-[280px] lg:max-w-[320px]">
          <h3 className="text-lg font-semibold text-white mb-4">Skills Distribution</h3>
          {pieData.length > 0 ? (
            <div className="relative h-[200px] lg:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={600}
                    animationBegin={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 27, 75, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Live score badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-white">{averageScore}%</span>
                <p className="text-xs text-slate-400">Live Score</p>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              Set your learning target to see skills
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[140px]">
          <p className="text-sm font-medium text-slate-300 mb-1">Skills</p>
          {pieData.slice(0, 6).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white truncate">{item.name}</span>
            </div>
          ))}
          {pieData.length > 6 && (
            <span className="text-xs text-slate-400">+{pieData.length - 6} more</span>
          )}
        </div>

        {/* Man on ladder - looking at chart */}
        <div className="absolute bottom-0 right-0 w-[180px] lg:w-[220px] h-[140px] lg:h-[180px] flex items-end justify-end opacity-90">
          <Image
            src="/images/skills-distribution-man.png"
            alt=""
            width={220}
            height={180}
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
}
