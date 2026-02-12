"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { skillProgress } from "@/data/progressData";

function getProficiencyColor(proficiency: string) {
  switch (proficiency) {
    case "expert":
      return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
    case "advanced":
      return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
    case "intermediate":
      return { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" };
    case "beginner":
    default:
      return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
  }
}

function getProgressColor(current: number, target: number) {
  const percentage = (current / target) * 100;
  if (percentage >= 100) return "bg-emerald-500";
  if (percentage >= 75) return "bg-teal-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getGapIndicator(current: number, target: number) {
  const diff = current - target;
  if (diff >= 0) {
    return (
      <div className="flex items-center gap-1 text-emerald-600">
        <TrendingUp className="w-4 h-4" />
        <span className="text-xs font-medium">+{diff}</span>
      </div>
    );
  } else if (diff >= -10) {
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <Minus className="w-4 h-4" />
        <span className="text-xs font-medium">{diff}</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="w-4 h-4" />
        <span className="text-xs font-medium">{diff}</span>
      </div>
    );
  }
}

export default function SkillCompetencyProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(skillProgress.map((s) => s.category)))];

  const filteredSkills = skillProgress.filter((s) => {
    if (selectedCategory === "all") return true;
    return s.category === selectedCategory;
  });

  // Calculate summary
  const skillsAtTarget = skillProgress.filter((s) => s.currentLevel >= s.targetLevel).length;
  const skillsWithGap = skillProgress.filter((s) => s.hasGap).length;
  const averageProgress = Math.round(
    skillProgress.reduce((sum, s) => sum + (s.currentLevel / s.targetLevel) * 100, 0) /
      skillProgress.length
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Skill & Competency Progress</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track skill development and identify gaps
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-emerald-600">
            <Target className="w-4 h-4" />
            <span>{skillsAtTarget} at target</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span>{skillsWithGap} need improvement</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
          <p className="text-sm text-teal-700 mb-1">Overall Skill Progress</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-teal-800">{averageProgress}%</p>
            <p className="text-sm text-teal-600 mb-1">of target</p>
          </div>
          <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${Math.min(averageProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-700 mb-1">Skills at Target</p>
          <p className="text-3xl font-bold text-emerald-800">
            {skillsAtTarget} / {skillProgress.length}
          </p>
          <p className="text-sm text-emerald-600 mt-1">Skills mastered</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-700 mb-1">Skill Gaps</p>
          <p className="text-3xl font-bold text-amber-800">{skillsWithGap}</p>
          <p className="text-sm text-amber-600 mt-1">Need improvement</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition capitalize ${
              selectedCategory === category
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const profColors = getProficiencyColor(skill.proficiency);
          const progressPercentage = Math.min((skill.currentLevel / skill.targetLevel) * 100, 100);

          return (
            <div
              key={skill.id}
              className={`border rounded-lg p-4 ${
                skill.hasGap ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-slate-800">{skill.name}</h3>
                  <p className="text-xs text-slate-500">{skill.category}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${profColors.bg} ${profColors.text}`}
                >
                  {skill.proficiency}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    {skill.currentLevel} / {skill.targetLevel}
                  </span>
                  {getGapIndicator(skill.currentLevel, skill.targetLevel)}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                      skill.currentLevel,
                      skill.targetLevel
                    )}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                    style={{ left: "100%" }}
                  />
                </div>
              </div>

              {/* Related Courses */}
              {skill.hasGap && skill.relatedCourses.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700">
                  <BookOpen className="w-3 h-3" />
                  <span>
                    {skill.relatedCourses.length} course{skill.relatedCourses.length > 1 ? "s" : ""}{" "}
                    to improve
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gap Alert */}
      {skillsWithGap > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Skill Gaps Identified
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Focus on the highlighted skills to meet your role requirements.
                Complete related courses and assignments to improve.
              </p>
            </div>
            <button className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition">
              View Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
