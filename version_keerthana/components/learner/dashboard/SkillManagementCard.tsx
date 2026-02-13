"use client";

import { useState, useEffect } from "react";
import { getLearningProfile, updateLearningProfile } from "@/lib/api/learningProfile";
import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";
import { Plus, X } from "lucide-react";

type Proficiency = "beginner" | "intermediate" | "advanced";

const PROFICIENCY_LABELS: Record<Proficiency, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const SUGGESTED_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "HTML/CSS",
  "Node.js",
  "TypeScript",
  "SQL",
  "UI/UX Design",
  "Data Analysis",
  "Cloud",
  "Git",
  "REST APIs",
];

export default function SkillManagementCard() {
  const { refresh: refreshProgress } = useLearnerProgressPage();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getLearningProfile>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<Proficiency>("beginner");

  useEffect(() => {
    getLearningProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const knownSkills = profile?.knownSkills ?? [];
  const skillGaps = profile?.skillGaps ?? [];
  const allSkillNames = new Set([...knownSkills, ...skillGaps]);
  const availableSuggestions = SUGGESTED_SKILLS.filter((s) => !allSkillNames.has(s));

  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      if (newProficiency === "advanced") {
        await updateLearningProfile({
          knownSkills: [...knownSkills, trimmed],
          skillGaps: skillGaps.filter((s) => s !== trimmed),
        });
      } else {
        await updateLearningProfile({
          skillGaps: [...skillGaps.filter((s) => s !== trimmed), trimmed],
          knownSkills: knownSkills.filter((s) => s !== trimmed),
        });
      }
      setNewSkill("");
      setProfile(await getLearningProfile());
      refreshProgress();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (name: string) => {
    if (saving) return;

    setSaving(true);
    try {
      await updateLearningProfile({
        knownSkills: knownSkills.filter((s) => s !== name),
        skillGaps: skillGaps.filter((s) => s !== name),
      });
      setProfile(await getLearningProfile());
      refreshProgress();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const allSkills = [
    ...knownSkills.map((n) => ({ name: n, proficiency: "advanced" as Proficiency })),
    ...skillGaps.map((n) => ({ name: n, proficiency: "beginner" as Proficiency })),
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-teal-50/30 border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <h3 className="text-base font-semibold text-slate-800 mb-2">Manage Skills</h3>
      <p className="text-sm text-slate-500 mb-4">
        Choose from suggestions or type your own. Select proficiency level.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {allSkills.map((s) => (
          <span
            key={s.name}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 text-sm font-medium border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all duration-200"
          >
            {s.name}
            <span className="text-xs text-teal-600">({PROFICIENCY_LABELS[s.proficiency]})</span>
            <button
              type="button"
              onClick={() => handleRemoveSkill(s.name)}
              disabled={saving}
              className="p-0.5 rounded hover:bg-teal-200 transition-transform hover:scale-110"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-600">Suggestions:</span>
          {availableSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleAddSkill(skill)}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800 hover:shadow-md transition-all duration-200"
            >
              + {skill}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill(newSkill)}
              placeholder="Or type your own skill..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
          </div>
          <select
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value as Proficiency)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            type="button"
            onClick={() => handleAddSkill(newSkill)}
            disabled={!newSkill.trim() || saving}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg text-sm font-medium hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
