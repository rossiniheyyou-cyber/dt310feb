"use client";

import { useLearnerProgress } from "@/context/LearnerProgressContext";
import Link from "next/link";

export default function SkillsOverview() {
  const { state } = useLearnerProgress();

  const skillsGained = state.skillsGained ?? [];
  const enrolledPaths = state.enrolledPathSlugs;

  const pathSkills: Record<string, string[]> = {
    fullstack: ["JavaScript", "React", "Node.js", "SQL", "Git", "Agile"],
    uiux: ["Figma", "Wireframing", "UX Research", "Design Systems"],
    "data-analyst": ["SQL", "Python", "Data Visualization", "Analytics"],
    "cloud-devops": ["Linux", "AWS", "Docker", "Kubernetes", "CI/CD"],
    qa: ["Manual Testing", "Automation", "API Testing", "Bug Tracking"],
    "digital-marketing": ["SEO", "SEM", "Content Marketing", "Analytics"],
  };

  const allPathSkills = new Set<string>();
  enrolledPaths.forEach((slug) => {
    pathSkills[slug]?.forEach((s) => allPathSkills.add(s));
  });

  const gainedSet = new Set(skillsGained);
  const skillsInProgress = Array.from(allPathSkills).filter(
    (s) => !gainedSet.has(s)
  );

  if (skillsGained.length === 0 && skillsInProgress.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">
          Skills & Competency Overview
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Start learning to track your skills.
        </p>
        <Link
          href="/dashboard/learner/courses"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View Learning Paths
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Skills & Competency Overview
      </h3>
      <div className="space-y-4">
        {skillsGained.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Skills gained
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsGained.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skillsInProgress.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Skills in progress
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsInProgress.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
