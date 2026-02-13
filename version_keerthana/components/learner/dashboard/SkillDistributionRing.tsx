"use client";

import { useState, useEffect } from "react";
import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";
import { getLearningProfile, updateLearningProfile } from "@/lib/api/learningProfile";
import { DASHBOARD_CHART_PALETTE } from "@/lib/tealPalette";
import { Plus, X } from "lucide-react";

type Proficiency = "beginner" | "intermediate" | "advanced";

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

/** Distinct shades - each skill easily identifiable in chart */
const SKILL_PALETTE = [...DASHBOARD_CHART_PALETTE];

const SIZE = 180;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;

export default function SkillDistributionRing() {
  const { data, refresh: refreshProgress } = useLearnerProgressPage();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getLearningProfile>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<Proficiency>("beginner");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const skillProgress = data?.skillProgress ?? [];
  const knownSkills = profile?.knownSkills ?? [];
  const skillGaps = profile?.skillGaps ?? [];
  const allSkillNames = new Set([...knownSkills, ...skillGaps]);
  const availableSuggestions = SUGGESTED_SKILLS.filter((s) => !allSkillNames.has(s));

  useEffect(() => {
    getLearningProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const total = skillProgress.reduce(
    (sum, s) => sum + Math.round((s.currentLevel / s.targetLevel) * 100),
    0
  );
  const segments = skillProgress.map((skill, i) => ({
    name: skill.name,
    value: Math.max(Math.round((skill.currentLevel / skill.targetLevel) * 100), 5),
    color: SKILL_PALETTE[i % SKILL_PALETTE.length],
  }));

  const circumference = 2 * Math.PI * RADIUS;
  let offset = 0;
  const segmentPaths = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const segLen = pct * circumference;
    const dashArray = `${segLen} ${circumference - segLen}`;
    const dashOffset = -offset;
    offset += segLen;
    return { ...seg, dashArray, dashOffset };
  });

  const averageScore =
    skillProgress.length > 0
      ? Math.round(
          skillProgress.reduce((sum, s) => sum + (s.currentLevel / s.targetLevel) * 100, 0) /
            skillProgress.length
        )
      : 0;

  const handleAddSkill = async () => {
    const skillName = (newSkill.trim() || selectedSuggestion).trim();
    if (!skillName || saving) return;

    setSaving(true);
    try {
      if (newProficiency === "advanced") {
        await updateLearningProfile({
          knownSkills: [...knownSkills, skillName],
          skillGaps: skillGaps.filter((s) => s !== skillName),
        });
      } else {
        await updateLearningProfile({
          skillGaps: [...skillGaps.filter((s) => s !== skillName), skillName],
          knownSkills: knownSkills.filter((s) => s !== skillName),
        });
      }
      setNewSkill("");
      setSelectedSuggestion("");
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

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-center mb-6">
        Skills Distribution
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={STROKE}
            />
            {segmentPaths.map((seg) => (
              <circle
                key={seg.name}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                className="transition-all duration-600"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{averageScore}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {/* All colored skills with remove */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {segments.map((seg) => (
              <div
                key={seg.name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50/80 border border-slate-200/80 hover:border-teal-200 hover:bg-teal-50/50 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-sm text-slate-700 font-medium whitespace-nowrap">{seg.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(seg.name)}
                  disabled={saving}
                  className="p-0.5 rounded hover:bg-slate-200 transition"
                  aria-label={`Remove ${seg.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Compact add skill row: dropdown + proficiency + Add */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedSuggestion}
              onChange={(e) => setSelectedSuggestion(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white min-w-[120px]"
            >
              <option value="">Select skill...</option>
              {availableSuggestions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => {
                setNewSkill(e.target.value);
                setSelectedSuggestion("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              placeholder="Or type skill"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white w-24 sm:w-28"
            />
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
              onClick={handleAddSkill}
              disabled={(!newSkill.trim() && !selectedSuggestion) || saving}
              className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      {segments.length === 0 && (
        <p className="text-center text-slate-500 text-sm pt-4">Add skills above to see distribution</p>
      )}
    </div>
  );
}
