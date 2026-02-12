"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  BookOpen,
  HelpCircle,
  Layers,
  Lightbulb,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { nextSteps } from "@/data/progressData";

function getTypeConfig(type: string) {
  switch (type) {
    case "assignment":
      return {
        icon: FileText,
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
        borderColor: "border-indigo-200",
      };
    case "course":
      return {
        icon: BookOpen,
        bgColor: "bg-teal-50",
        textColor: "text-teal-600",
        borderColor: "border-teal-200",
      };
    case "quiz":
      return {
        icon: HelpCircle,
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        borderColor: "border-purple-200",
      };
    case "module":
      return {
        icon: Layers,
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        borderColor: "border-orange-200",
      };
    case "skill":
      return {
        icon: Lightbulb,
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
        borderColor: "border-amber-200",
      };
    default:
      return {
        icon: ArrowRight,
        bgColor: "bg-slate-50",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
      };
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          High Priority
        </span>
      );
    case "medium":
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          Medium
        </span>
      );
    case "low":
      return (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
          Recommended
        </span>
      );
    default:
      return null;
  }
}

export default function NextStepsRecommendations() {
  const highPriority = nextSteps.filter((s) => s.priority === "high");
  const otherSteps = nextSteps.filter((s) => s.priority !== "high");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
          <Sparkles className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Next Steps & Recommendations</h2>
          <p className="text-sm text-slate-500">
            Personalized actions to accelerate your learning
          </p>
        </div>
      </div>

      {/* High Priority Alert */}
      {highPriority.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-red-800">
              {highPriority.length} High Priority Action{highPriority.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {highPriority.map((step) => {
              const typeConfig = getTypeConfig(step.type);
              const TypeIcon = typeConfig.icon;

              return (
                <Link
                  key={step.id}
                  href={step.link}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                      <TypeIcon className={`w-4 h-4 ${typeConfig.textColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700 transition">
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {step.dueDate && (
                      <span className="text-xs text-red-600 font-medium">
                        Due: {new Date(step.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Recommended Next Actions</h3>
        {otherSteps.map((step) => {
          const typeConfig = getTypeConfig(step.type);
          const TypeIcon = typeConfig.icon;

          return (
            <Link
              key={step.id}
              href={step.link}
              className={`flex items-center justify-between p-4 rounded-lg border ${typeConfig.borderColor} hover:shadow-sm transition group`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${typeConfig.bgColor}`}>
                  <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700 transition">
                      {step.title}
                    </p>
                    {getPriorityBadge(step.priority)}
                  </div>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {step.dueDate && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Due Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(step.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-100 transition">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Insight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-teal-800 mb-1">AI Learning Insight</p>
            <p className="text-sm text-teal-700">
              Based on your progress, completing the HTML & CSS course and retaking the Flexbox quiz
              will help you meet your 85% completion target by next week. Focus on high-priority items
              first for optimal progress.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition">
            View Personalized Plan
          </button>
          <button className="px-4 py-2 border border-teal-300 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-50 transition">
            Ask AI Mentor
          </button>
        </div>
      </div>
    </div>
  );
}
