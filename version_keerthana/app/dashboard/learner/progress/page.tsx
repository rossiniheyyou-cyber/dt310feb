"use client";

import { useState } from "react";
import {
  ProgressOverview,
  LearningPathProgress,
  CourseBreakdown,
  AssignmentProgressSection,
  QuizProgressSection,
  SkillCompetencyProgress,
  TimeActivitySection,
  CertificationProgress,
  ComplianceStatus,
  NextStepsRecommendations,
} from "@/components/learner/progress";

type SectionKey =
  | "overview"
  | "path"
  | "courses"
  | "assignments"
  | "quizzes"
  | "skills"
  | "activity"
  | "certifications"
  | "compliance"
  | "next";

const sections: { key: SectionKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "path", label: "Learning Path" },
  { key: "courses", label: "Courses" },
  { key: "assignments", label: "Assignments" },
  { key: "quizzes", label: "Quizzes" },
  { key: "skills", label: "Skills" },
  { key: "activity", label: "Activity" },
  { key: "certifications", label: "Certifications" },
  { key: "compliance", label: "Compliance" },
  { key: "next", label: "Next Steps" },
];

export default function LearnerProgressPage() {
  const [activeSection, setActiveSection] = useState<SectionKey | "all">("all");

  const scrollToSection = (key: SectionKey) => {
    const element = document.getElementById(`section-${key}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Progress Dashboard</h1>
              <p className="text-sm text-slate-500">
                Track your learning journey and performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection("all")}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  activeSection === "all"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                View All
              </button>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => {
                  setActiveSection(section.key);
                  scrollToSection(section.key);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${
                  activeSection === section.key
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <section id="section-overview">
          <ProgressOverview />
        </section>

        {/* Next Steps & Recommendations - Highlighted at top for action items */}
        <section id="section-next">
          <NextStepsRecommendations />
        </section>

        {/* Learning Path Progress */}
        <section id="section-path">
          <LearningPathProgress />
        </section>

        {/* Course Progress Breakdown */}
        <section id="section-courses">
          <CourseBreakdown />
        </section>

        {/* Two Column Layout for Assignment & Quiz */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Assignment Progress */}
          <section id="section-assignments">
            <AssignmentProgressSection />
          </section>

          {/* Quiz & Assessment Progress */}
          <section id="section-quizzes">
            <QuizProgressSection />
          </section>
        </div>

        {/* Skill & Competency Progress */}
        <section id="section-skills">
          <SkillCompetencyProgress />
        </section>

        {/* Time & Learning Activity */}
        <section id="section-activity">
          <TimeActivitySection />
        </section>

        {/* Two Column Layout for Certifications & Compliance */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Certification Progress */}
          <section id="section-certifications">
            <CertificationProgress />
          </section>

          {/* Compliance Status */}
          <section id="section-compliance">
            <ComplianceStatus />
          </section>
        </div>
      </div>
    </div>
  );
}
