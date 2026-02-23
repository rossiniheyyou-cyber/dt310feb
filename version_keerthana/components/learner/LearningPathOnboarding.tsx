"use client";

import { useState } from "react";
import { X, Sparkles, Target, BookOpen } from "lucide-react";
import { analyzeSkillGap } from "@/lib/api/learningPath";
import { updateLearningProfile } from "@/lib/api/learningProfile";
import { enrollInPath } from "@/lib/learnerProgressStore";

const DOMAIN_OPTIONS = [
  { slug: "fullstack", label: "Full Stack Web Development", hint: "Build web apps" },
  { slug: "uiux", label: "UI / UX Designer", hint: "Design interfaces" },
  { slug: "data-analyst", label: "Data Analyst / Engineer", hint: "Data & analytics" },
  { slug: "cloud-devops", label: "Cloud & DevOps", hint: "Infrastructure" },
  { slug: "qa", label: "QA / Software Tester", hint: "Testing" },
  { slug: "digital-marketing", label: "Digital Marketing", hint: "Marketing" },
];

const COMMON_SKILLS = [
  "HTML/CSS",
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "SQL",
  "Git",
  "REST APIs",
  "Figma",
  "Data Analysis",
  "Testing",
  "None / Beginner",
];

interface LearningPathOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function LearningPathOnboarding({
  isOpen,
  onClose,
  onComplete,
}: LearningPathOnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkill("");
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await analyzeSkillGap(goal, selectedSkills);
      await updateLearningProfile({
        goal,
        knownSkills: selectedSkills,
        recommendedPathSlug: result.recommendedPathSlug,
        skillGaps: result.skillGaps,
        personalizedMessage: result.personalizedMessage,
        completedOnboarding: true,
      });
      enrollInPath(result.recommendedPathSlug);
      onComplete();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(msg || "Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Personalize Your Learning Path
              </h2>
              <p className="text-sm text-slate-500">
                AI will match your goal with the best path
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Target size={16} className="text-teal-600" />
                  What is your goal?
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., I want to build web applications with Full Stack Web Development"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  rows={3}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!goal.trim()}
                className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next: What do you know?
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <BookOpen size={16} className="text-teal-600" />
                  What do you already know? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        selectedSkills.includes(skill)
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
                >
                  Review & Generate
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-700">Goal:</span>{" "}
                  {goal}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Skills:</span>{" "}
                  {selectedSkills.length > 0
                    ? selectedSkills.join(", ")
                    : "None selected"}
                </p>
              </div>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate My Path
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
