"use client";

import { useState, useEffect, useCallback } from "react";
import { useLearnerProgressPage } from "@/context/LearnerProgressPageContext";
import { getLearningProfile, updateLearningProfile } from "@/lib/api/learningProfile";
import { DASHBOARD_CHART_PALETTE } from "@/lib/tealPalette";
import { Plus, Pencil, X } from "lucide-react";

type Proficiency = "beginner" | "intermediate" | "advanced";
type Action = "add" | "modify" | "delete";

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

const SKILL_PALETTE = [...DASHBOARD_CHART_PALETTE];

const SIZE = 180;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

export default function SkillDistributionRing() {
  const { data, refresh: refreshProgress } = useLearnerProgressPage();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getLearningProfile>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<Action>("add");
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<Proficiency>("beginner");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [modifySkill, setModifySkill] = useState("");
  const [modifyProficiency, setModifyProficiency] = useState<Proficiency>("beginner");
  const [deleteSkill, setDeleteSkill] = useState("");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const skillProgress = data?.skillProgress ?? [];
  const knownSkills = profile?.knownSkills ?? [];
  const skillGaps = profile?.skillGaps ?? [];
  const allSkillNames = [...knownSkills, ...skillGaps];
  const availableSuggestions = SUGGESTED_SKILLS.filter((s) => !allSkillNames.includes(s));

  useEffect(() => {
    getLearningProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  // Build segments from user's profile (knownSkills + skillGaps) so ring always reflects what they added
  const progressMap = new Map(skillProgress.map((s) => [s.name, s]));
  const segments = allSkillNames.map((name, i) => {
    const sp = progressMap.get(name);
    const value = sp
      ? Math.max(Math.round((sp.currentLevel / sp.targetLevel) * 100), 5)
      : knownSkills.includes(name)
        ? 80
        : 50;
    return {
      name,
      value,
      color: SKILL_PALETTE[i % SKILL_PALETTE.length],
    };
  });
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const circumference = 2 * Math.PI * RADIUS;
  let offset = 0;
  const segmentData = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const segLen = Math.max(pct * circumference, 2);
    const dashArray = `${segLen} ${circumference - segLen}`;
    const dashOffset = -offset;
    offset += segLen;
    return { ...seg, dashArray, dashOffset };
  });

  const averageScore =
    segments.length > 0
      ? Math.round(segments.reduce((sum, s) => sum + s.value, 0) / segments.length)
      : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

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

  const handleModifySkill = async () => {
    if (!modifySkill || saving) return;

    setSaving(true);
    try {
      const newKnownSkills =
        modifyProficiency === "advanced"
          ? [...knownSkills.filter((s) => s !== modifySkill), modifySkill]
          : knownSkills.filter((s) => s !== modifySkill);
      const newSkillGaps =
        modifyProficiency === "advanced"
          ? skillGaps.filter((s) => s !== modifySkill)
          : [...skillGaps.filter((s) => s !== modifySkill), modifySkill];
      await updateLearningProfile({ knownSkills: newKnownSkills, skillGaps: newSkillGaps });
      setModifySkill("");
      setProfile(await getLearningProfile());
      refreshProgress();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async () => {
    if (!deleteSkill || saving) return;

    setSaving(true);
    try {
      await updateLearningProfile({
        knownSkills: knownSkills.filter((s) => s !== deleteSkill),
        skillGaps: skillGaps.filter((s) => s !== deleteSkill),
      });
      setDeleteSkill("");
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
    <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 relative">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-center mb-6">
        Skills Distribution
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Ring - skills shown only on hover */}
        <div className="relative flex-shrink-0">
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={STROKE}
            />
            {segmentData.map((seg) => (
              <g key={seg.name}>
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  className="transition-opacity duration-200"
                  style={{ opacity: hoveredSkill ? (hoveredSkill === seg.name ? 1 : 0.4) : 1 }}
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={STROKE * 2}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredSkill(seg.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  onMouseMove={handleMouseMove}
                />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">{averageScore}%</span>
          </div>
        </div>

        {hoveredSkill && (
          <div
            className="fixed z-50 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-medium shadow-lg pointer-events-none"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y + 8,
              transform: "translateY(-50%)",
            }}
          >
            {hoveredSkill}
          </div>
        )}

        {/* Action dropdown + form - stacked vertically */}
        <div className="flex-1 min-w-0 w-full max-w-[220px] space-y-4">
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value as Action);
              setNewSkill("");
              setSelectedSuggestion("");
              setModifySkill("");
              setDeleteSkill("");
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="add">Add new skill</option>
            <option value="modify">Modify</option>
            <option value="delete">Delete</option>
          </select>

          {action === "add" && (
            <div className="space-y-3">
              <select
                value={selectedSuggestion}
                onChange={(e) => setSelectedSuggestion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              />
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value as Proficiency)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={(!newSkill.trim() && !selectedSuggestion) || saving}
                className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          )}

          {action === "modify" && (
            <div className="space-y-3">
              <select
                value={modifySkill}
                onChange={(e) => setModifySkill(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select skill to modify...</option>
                {allSkillNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={modifyProficiency}
                onChange={(e) => setModifyProficiency(e.target.value as Proficiency)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleModifySkill}
                disabled={!modifySkill || saving}
                className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Pencil size={14} />
                Update
              </button>
            </div>
          )}

          {action === "delete" && (
            <div className="space-y-3">
              <select
                value={deleteSkill}
                onChange={(e) => setDeleteSkill(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select skill to delete...</option>
                {allSkillNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleRemoveSkill}
                disabled={!deleteSkill || saving}
                className="w-full px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <X size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {segments.length === 0 && (
        <p className="text-center text-slate-500 text-sm pt-4">Add skills to see distribution</p>
      )}
    </div>
  );
}
