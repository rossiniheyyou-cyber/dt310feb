"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight, Loader2, BookOpen, Award } from "lucide-react";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { syncCoursesFromBackend } from "@/lib/canonicalStore";
import AiQuizModal from "@/components/learner/AiQuizModal";
import type { AiQuizDifficulty } from "@/lib/api/aiQuiz";
import { learningPaths } from "@/data/learningPaths";

const DIFFICULTIES: { value: AiQuizDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function AiQuizPage() {
  const { state } = useLearnerProgress();
  const { getPublishedCoursesForPath } = useCanonicalStore();
  const [mounted, setMounted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);
  const [difficulty, setDifficulty] = useState<AiQuizDifficulty>("medium");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncCoursesFromBackend().catch(console.error);
  }, []);

  const enrolledSlugs = state.enrolledPathSlugs || [];
  const pathTitles: Record<string, string> = {};
  learningPaths.forEach((p) => {
    pathTitles[p.slug] = p.title;
  });
  const coursesByPath = enrolledSlugs.flatMap((pathSlug) => {
    const courses = getPublishedCoursesForPath(pathSlug);
    return courses.map((c) => ({ course: c, pathSlug, pathTitle: pathTitles[pathSlug] || pathSlug }));
  });
  const flatCourses = coursesByPath.map(({ course }) => ({
    id: course.id,
    title: course.title,
    pathTitle: coursesByPath.find((x) => x.course.id === course.id)?.pathTitle,
  }));
  const uniqueCourses = flatCourses.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );

  const handleStartQuiz = () => {
    if (!selectedCourse) return;
    setModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={28} className="text-teal-600" />
            AI Quiz
          </h1>
          <p className="text-slate-600 mt-1">
            Practice with 10 MCQs based on the courses you&apos;re watching. Choose a topic and difficulty, then take the quiz. All quizzes are auto-graded.
          </p>
        </div>

        <section className="mb-8 p-6 rounded-xl border border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-teal-600" />
            Start practice quiz
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Select a course (topic) and difficulty. Questions will be generated from that topic.
          </p>

          {uniqueCourses.length === 0 ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              You need to be enrolled in at least one course to take an AI quiz.{" "}
              <Link href="/dashboard/learner/courses/available" className="font-medium underline">
                Browse courses
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Course / topic</label>
                <select
                  value={selectedCourse?.id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const c = uniqueCourses.find((x) => x.id === id);
                    setSelectedCourse(c ? { id: c.id, title: c.title } : null);
                  }}
                  className="w-full max-w-md px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select a course</option>
                  {uniqueCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                      {c.pathTitle ? ` (${c.pathTitle})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        difficulty === d.value
                          ? "bg-teal-600 text-white"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={!selectedCourse}
                className="px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Start 10-question quiz
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </section>

        <section>
          <Link
            href="/dashboard/learner/ai-quiz/attempts"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-teal-200"
          >
            <Award size={20} />
            View past attempts
            <ChevronRight size={18} />
          </Link>
        </section>
      </div>

      {selectedCourse && (
        <AiQuizModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          courseTitle={selectedCourse.title}
          courseId={selectedCourse.id}
          lessonTitle={undefined}
          initialDifficulty={difficulty}
        />
      )}
    </div>
  );
}
