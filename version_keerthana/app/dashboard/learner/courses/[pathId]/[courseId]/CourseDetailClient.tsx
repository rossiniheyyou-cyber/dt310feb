"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChevronRight,
  Play,
  Lock,
  Check,
  FileText,
  Download,
  Award,
  Video,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Sparkles,
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { LearningPath, Course, Module } from "@/data/learningPaths";
import { ASSESSMENT_PROBLEMS } from "@/data/canonicalCourses";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import AIMentorModal from "@/components/learner/AIMentorModal";
import AiQuizModal from "@/components/learner/AiQuizModal";
import TakeInstructorQuizModal from "@/components/learner/TakeInstructorQuizModal";
import CourseModuleQuizModal from "@/components/learner/CourseModuleQuizModal";
import { gradeLearnerAssignment } from "@/lib/api/aiAssignmentGrade";
import { listQuizzesByCourse, type QuizSummary } from "@/lib/api/quizzes";
import { getYoutubeKeyword, getYoutubeRecommendations } from "@/lib/api/recommendations";
import type { YoutubeVideoSummary } from "@/lib/api/recommendations";
import { getLessonsByCourse } from "@/lib/api/lessons";
import { completeCourse, completeLesson } from "@/lib/api/progress";
import { getLearningProfile, updateLearningProfile } from "@/lib/api/learningProfile";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

type Props = {
  path: LearningPath;
  course: Course & { backendId?: number; videoUrl?: string };
  autoPlayFirst?: boolean;
};

export function CourseDetailClient({ path, course, autoPlayFirst = false }: Props) {
  const { state, recordCourseAccess, recordModuleComplete } = useLearnerProgress();
  const [activeModule, setActiveModule] = useState<Module | null>(
    course.modules.find((m) => !m.locked) ?? course.modules[0] ?? null
  );
  const [modules, setModules] = useState(course.modules);
  const [completedModules, setCompletedModules] = useState<Set<string>>(
    () => new Set(course.modules.filter((m) => m.completed).map((m) => m.id))
  );
  const hasRestoredRef = useRef(false);
  const [restoreComplete, setRestoreComplete] = useState(false);

  // Restore from stored progress on mount (resume where left off) - useLayoutEffect so we don't overwrite store
  useLayoutEffect(() => {
    const key = `${path.slug}-${course.id}`;
    const entry = state.courseProgress[key];
    if (!entry) {
      setRestoreComplete(true);
      return;
    }
    if (hasRestoredRef.current) {
      setRestoreComplete(true);
      return;
    }
    hasRestoredRef.current = true;

    const storedCompleted = new Set(entry.completedModuleIds ?? []);
    setCompletedModules(storedCompleted);

    // Update modules: mark completed, unlock next after completed
    const baseModules = course.modules;
    const updated = baseModules.map((m, idx) => {
      const completed = storedCompleted.has(m.id);
      const prevCompleted = idx > 0 ? storedCompleted.has(baseModules[idx - 1].id) : true;
      const locked = idx > 0 && !prevCompleted;
      return { ...m, completed, locked };
    });
    setModules(updated);

    // Restore active module from last accessed
    if (entry.currentModuleId) {
      const idx = updated.findIndex((m) => m.id === entry.currentModuleId);
      if (idx >= 0 && !updated[idx].locked) {
        setActiveModule(updated[idx]);
      }
    }
    setRestoreComplete(true);
  }, [path.slug, course.id, course.modules, state.courseProgress]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAIMentor, setShowAIMentor] = useState(false);
  const [showAiQuiz, setShowAiQuiz] = useState(false);
  const [assignedQuizzes, setAssignedQuizzes] = useState<QuizSummary[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [takeQuizId, setTakeQuizId] = useState<number | null>(null);
  const [takeQuizTitle, setTakeQuizTitle] = useState("");
  const [showModuleQuiz, setShowModuleQuiz] = useState(false);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [assignmentGrading, setAssignmentGrading] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{ passed: boolean; feedback: string } | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [supplementalVideos, setSupplementalVideos] = useState<YoutubeVideoSummary[]>([]);
  const [supplementalLoading, setSupplementalLoading] = useState(false);
  const [backendLessonIds, setBackendLessonIds] = useState<number[]>([]);
  const playerRef = useRef<typeof ReactPlayer | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const [shouldAutoPlayNext, setShouldAutoPlayNext] = useState(false);

  // Default video: course-level video link from instructor, or sample
  const defaultVideoUrl = course.videoUrl?.trim() || SAMPLE_VIDEO_URL;

  const currentProgress =
    modules.length > 0
      ? Math.round((completedModules.size / modules.length) * 100)
      : 0;

  const [courseCompletionSent, setCourseCompletionSent] = useState(false);
  const [skillsSyncedToProfile, setSkillsSyncedToProfile] = useState(false);

  // When the learner completes the full course, notify instructor via backend (best-effort).
  useEffect(() => {
    const bid = course.backendId;
    if (courseCompletionSent) return;
    if (bid == null || typeof bid !== "number") return;
    if (currentProgress !== 100) return;
    completeCourse(bid)
      .then(() => setCourseCompletionSent(true))
      .catch(() => {});
  }, [course.backendId, courseCompletionSent, currentProgress]);

  // Update skill distribution when course is completed — add course skills to learning profile
  useEffect(() => {
    if (currentProgress !== 100 || skillsSyncedToProfile || !course.skills?.length) return;
    let cancelled = false;
    getLearningProfile()
      .then((profile) => {
        if (cancelled) return;
        const knownSet = new Set(profile.knownSkills ?? []);
        const toAdd = course.skills.filter((s) => !knownSet.has(s));
        if (toAdd.length === 0) {
          setSkillsSyncedToProfile(true);
          return;
        }
        return updateLearningProfile({
          knownSkills: [...(profile.knownSkills ?? []), ...toAdd],
          skillGaps: (profile.skillGaps ?? []).filter((s) => !toAdd.includes(s)),
        });
      })
      .then(() => {
        if (!cancelled) setSkillsSyncedToProfile(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentProgress, skillsSyncedToProfile, course.skills]);

  useEffect(() => {
    if (!restoreComplete) return;
    recordCourseAccess(
      path.slug,
      course.id,
      course.title,
      path.title,
      activeModule?.id ?? null,
      activeModule?.title ?? null,
      modules.length,
      Array.from(completedModules)
    );
  }, [restoreComplete, path.slug, path.title, course.id, course.title, activeModule?.id, activeModule?.title, modules.length, completedModules, recordCourseAccess]);

  // Reset playing video when switching module
  useEffect(() => {
    setPlayingVideoUrl(null);
  }, [activeModule?.id]);

  // Fetch backend lessons for this course (for "Complete Lesson" → UserProgress)
  useEffect(() => {
    const bid = course.backendId;
    if (bid == null || typeof bid !== "number") return;
    let cancelled = false;
    getLessonsByCourse(String(bid), { sortBy: "order", sortOrder: "ASC" })
      .then((res) => {
        if (!cancelled && res.items?.length)
          setBackendLessonIds(res.items.map((l) => Number(l.id)));
      })
      .catch(() => {})
      .finally(() => {});
    return () => { cancelled = true; };
  }, [course.backendId]);

  // Fetch assigned quizzes for this course (instructor-created, auto-graded)
  useEffect(() => {
    const bid = course.backendId;
    if (bid == null || typeof bid !== "number") return;
    let cancelled = false;
    setQuizzesLoading(true);
    listQuizzesByCourse(bid)
      .then((res) => {
        if (!cancelled) setAssignedQuizzes(res.quizzes || []);
      })
      .catch(() => {
        if (!cancelled) setAssignedQuizzes([]);
      })
      .finally(() => {
        if (!cancelled) setQuizzesLoading(false);
      });
    return () => { cancelled = true; };
  }, [course.backendId]);

  // Fetch AI-Powered Supplemental Learning (top 3 YouTube videos) when on a video module
  useEffect(() => {
    const isVideoModule = activeModule && (activeModule.type === "video" || !activeModule.type);
    if (!isVideoModule) {
      setSupplementalVideos([]);
      return;
    }
    let cancelled = false;
    setSupplementalLoading(true);
    setSupplementalVideos([]);
    (async () => {
      try {
        const { searchString } = await getYoutubeKeyword(course.title, activeModule.title ?? "");
        if (cancelled) return;
        const { videos } = await getYoutubeRecommendations(searchString);
        if (!cancelled) setSupplementalVideos(videos ?? []);
      } catch {
        if (!cancelled) setSupplementalVideos([]);
      } finally {
        if (!cancelled) setSupplementalLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeModule?.id, activeModule?.title, course.title]);

  const markModuleComplete = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    const modIdx = modules.findIndex((m) => m.id === moduleId);
    setCompletedModules((prev) => new Set([...prev, moduleId]));
    // Record lesson completion in backend (UserProgress) when we have a matching lesson
    const backendLessonId = modIdx >= 0 && modIdx < backendLessonIds.length ? backendLessonIds[modIdx] : undefined;
    if (backendLessonId != null) {
      completeLesson(backendLessonId).catch(() => {});
    }
    recordModuleComplete(
      path.slug,
      course.id,
      course.title,
      path.title,
      moduleId,
      mod?.title ?? moduleId,
      modules.length,
      course.skills ?? []
    );
    if (modIdx >= 0 && modIdx < modules.length - 1) {
      const next = modules[modIdx + 1];
      if (next?.locked) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === next.id ? { ...m, locked: false } : m
          )
        );
      }
      // Auto-advance to next module; auto-play if both current and next are videos
      const isCurrentVideo = mod && (mod.type === "video" || !mod.type);
      const isNextVideo = next && (next.type === "video" || !next.type);
      if (isCurrentVideo && isNextVideo) {
        setActiveModule(next);
        setShouldAutoPlayNext(true);
      } else if (next) {
        setActiveModule(next);
      }
    }
  };

  const canAccessModule = (m: Module) => {
    if (!m.locked) return true;
    const idx = modules.findIndex((mod) => mod.id === m.id);
    if (idx <= 0) return true;
    const prev = modules[idx - 1];
    return prev ? completedModules.has(prev.id) : false;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-600">
          <Link
            href="/dashboard/learner/courses/my-courses"
            className="hover:text-teal-600 transition"
          >
            My Courses
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link
            href={`/dashboard/learner/courses/${path.slug}`}
            className="hover:text-teal-600 transition"
          >
            {path.title}
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-900 font-medium">{course.title}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left: Video / Content Area */}
        <main className="flex-1 p-6 lg:p-8 order-2 lg:order-1">
          {/* Video Player — supports lesson URL or YouTube (supplemental) */}
          {activeModule && (activeModule.type === "video" || !activeModule.type) && (
            <div className="mb-6">
              <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                <ReactPlayer
                  ref={playerRef}
                  url={playingVideoUrl || (activeModule as { videoUrl?: string }).videoUrl || defaultVideoUrl}
                  controls
                  width="100%"
                  height="100%"
                  playbackRate={playbackSpeed}
                  playing={(autoPlayFirst && !hasAutoPlayedRef.current && !playingVideoUrl) || shouldAutoPlayNext}
                  onPlay={() => {
                    hasAutoPlayedRef.current = true;
                    setShouldAutoPlayNext(false);
                  }}
                  onEnded={() => markModuleComplete(activeModule.id)}
                  config={{
                    file: { attributes: { controlsList: "nodownload" } },
                  }}
                />
                {/* Playback speed overlay */}
                <div className="absolute bottom-16 right-4 flex gap-2 z-10">
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="px-2 py-1 rounded bg-black/60 text-white text-sm border-0"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                      <option key={s} value={s}>
                        {s}x
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeModule.title}
                </h2>
                <button
                  onClick={() => markModuleComplete(activeModule.id)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Mark as complete
                </button>
              </div>

              {/* AI-Powered Supplemental Learning — 3 YouTube videos */}
              <section className="mt-6">
                <h3 className="text-base font-semibold text-slate-800 mb-3">
                  AI-Powered Supplemental Learning
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Watch these recommended videos to deepen your understanding. Click to play in the player above.
                </p>
                {supplementalLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                    <Loader2 size={18} className="animate-spin" />
                    Finding relevant videos…
                  </div>
                ) : supplementalVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {supplementalVideos.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setPlayingVideoUrl(`https://www.youtube.com/watch?v=${v.id}`)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                          playingVideoUrl === `https://www.youtube.com/watch?v=${v.id}`
                            ? "border-teal-500 ring-2 ring-teal-200"
                            : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="aspect-video bg-slate-200 relative">
                          {v.thumbnail ? (
                            <img
                              src={v.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={32} className="text-white drop-shadow" />
                          </div>
                        </div>
                        <p className="p-3 text-sm font-medium text-slate-800 line-clamp-2">
                          {v.title || "Video"}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-2">
                    No supplemental videos available for this lesson.
                  </p>
                )}
              </section>
            </div>
          )}

          {/* Ask AI Mentor + Take AI Quiz */}
          {activeModule && (
            <div className="mb-6 flex flex-wrap justify-end gap-2">
              <div className="group relative">
                <button
                  onClick={() => setShowAiQuiz(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                >
                  <HelpCircle size={16} />
                  Take AI Quiz
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition z-10 w-56 text-center">
                  For self-assessment only. Does not affect readiness or skills. Logs are saved in AI Quiz page.
                </div>
              </div>
              <button
                onClick={() => setShowAIMentor(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition shadow-sm"
              >
                <Sparkles size={16} />
                Ask AI Mentor
              </button>
            </div>
          )}

          {/* Assigned Quizzes (instructor-created, auto-graded) */}
          {course.backendId != null && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-slate-800 mb-3">Assigned Quizzes</h3>
              {quizzesLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                  <Loader2 size={18} className="animate-spin" />
                  Loading quizzes…
                </div>
              ) : assignedQuizzes.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No quizzes assigned for this course yet.</p>
              ) : (
                <ul className="space-y-2">
                  {assignedQuizzes.map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-200 hover:bg-teal-50/30"
                    >
                      <span className="font-medium text-slate-800">{q.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTakeQuizId(q.id);
                          setTakeQuizTitle(q.title);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                      >
                        Take quiz
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Quiz / Assignment */}
          {activeModule &&
            (activeModule.type === "quiz" || activeModule.type === "assignment") && (
              <div className="mb-6 rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  {activeModule.type === "quiz" ? (
                    <HelpCircle size={24} className="text-teal-600" />
                  ) : (
                    <ClipboardList size={24} className="text-teal-600" />
                  )}
                  <h2 className="text-lg font-semibold text-slate-900">
                    {activeModule.title}
                  </h2>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  {activeModule.type === "quiz"
                    ? "Complete the quiz to test your understanding. Quizzes are auto-graded by AI."
                    : "Submit your assignment to proceed. Upload your work and AI will grade it. Assignments are auto-graded."}
                </p>
                {activeModule.type === "assignment" && (
                  (() => {
                    const assignId =
                      course.id === "html-css"
                        ? "html-css-final"
                        : course.id === "javascript-fundamentals"
                          ? "js-fundamentals-final"
                          : null;
                    const problem = assignId ? ASSESSMENT_PROBLEMS[assignId] : null;
                    if (!problem) {
                      return (
                        <p className="text-sm text-slate-500">No assessment is configured for this course yet.</p>
                      );
                    }
                    return (
                      <>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4 prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm">{problem}</pre>
                        </div>
                        {!assignmentResult ? (
                          <>
                            <label className="block mb-3">
                              <span className="text-sm font-medium text-slate-700 mb-2 block">Upload your submission</span>
                              <input
                                type="file"
                                accept="*/*"
                                multiple
                                onChange={(e) => {
                                  const list = e.target.files;
                                  setAssignmentFiles(list ? Array.from(list) : []);
                                  setAssignmentResult(null);
                                }}
                                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                              />
                            </label>
                            {assignmentFiles.length > 0 && (
                              <p className="text-sm text-slate-500 mb-3">
                                Selected: {assignmentFiles.length} file(s) — {assignmentFiles.map((f) => f.name).join(", ")}
                              </p>
                            )}
                            <button
                              onClick={async () => {
                                if (!assignmentFiles.length || !assignId || !problem) return;
                                setAssignmentGrading(true);
                                setAssignmentResult(null);
                                try {
                                  const parts = await Promise.all(assignmentFiles.map((f) => f.text()));
                                  const text = parts.join("\n\n");
                                  const res = await gradeLearnerAssignment({
                                    assignmentTitle:
                                      assignId === "js-fundamentals-final"
                                        ? "Interactive JavaScript Project"
                                        : "Personal Portfolio Page",
                                    problemStatement: problem,
                                    submissionContent: text,
                                  });
                                  setAssignmentResult(res);
                                  if (res.passed) markModuleComplete(activeModule.id);
                                } catch {
                                  setAssignmentResult({
                                    passed: false,
                                    feedback: "Failed to grade. Please try again or check your submission format.",
                                  });
                                } finally {
                                  setAssignmentGrading(false);
                                }
                              }}
                              disabled={!assignmentFiles.length || assignmentGrading}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
                            >
                              {assignmentGrading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Grading…
                                </>
                              ) : (
                                <>
                                  <Upload size={16} />
                                  Submit for grading
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <div className={`p-4 rounded-lg border mb-4 ${assignmentResult.passed ? "bg-teal-50 border-teal-200" : "bg-amber-50 border-amber-200"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {assignmentResult.passed ? (
                                <CheckCircle size={20} className="text-teal-600" />
                              ) : (
                                <AlertCircle size={20} className="text-amber-600" />
                              )}
                              <span className={`font-medium ${assignmentResult.passed ? "text-teal-800" : "text-amber-800"}`}>
                                {assignmentResult.passed ? "Passed" : "Not passed"}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{assignmentResult.feedback}</p>
                            {!assignmentResult.passed && (
                              <button
                                onClick={() => {
                                  setAssignmentResult(null);
                                  setAssignmentFiles([]);
                                }}
                                className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                              >
                                Try again with a new submission
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()
                )}
                {activeModule.type === "quiz" && (
                  <button
                    onClick={() => setShowModuleQuiz(true)}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
                  >
                    Take Quiz
                  </button>
                )}
              </div>
            )}

          {/* Course Overview */}
          <section className="mb-8">
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Course Overview
            </h3>
            <p className="text-slate-600 text-sm mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500">Duration: {course.duration}</p>
          </section>

          {/* Instructor */}
          <section className="mb-8">
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Instructor
            </h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                {course.instructor.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {course.instructor.name}
                </p>
                <p className="text-sm text-slate-500">
                  {course.instructor.role}
                </p>
              </div>
            </div>
          </section>

          {/* Resources — open in LMS viewer by default; download option kept */}
          <section>
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Resources
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <ResourceCard
                label="DBMS 23BCS1021"
                fileUrl="/course-resources/notes.pdf"
                type="pdf"
              />
              <ResourceCard
                label="Automated Parking System Capstone"
                fileUrl="/course-resources/capstone.pdf"
                type="pdf"
              />
            </div>
          </section>
        </main>

        {/* Right: Module Sidebar */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/30 p-6 order-1 lg:order-2">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Course Content
            </h3>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
              <span>Progress</span>
              <span>{currentProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          <nav className="space-y-1">
            {modules.map((module, idx) => {
              const isActive = activeModule?.id === module.id;
              const isCompleted = completedModules.has(module.id);
              const canAccess = canAccessModule(module);

              return (
                <button
                  key={module.id}
                  onClick={() => {
                    if (canAccess) {
                      setActiveModule(module);
                      setAssignmentResult(null);
                      setAssignmentFiles([]);
                    }
                  }}
                  disabled={!canAccess}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    isActive
                      ? "bg-teal-50 border border-teal-200 text-teal-800"
                      : canAccess
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                        <Check size={14} className="text-teal-600" />
                      </div>
                    ) : !canAccess ? (
                      <Lock size={16} className="text-slate-400" />
                    ) : module.type === "video" ? (
                      <Video size={16} className="text-slate-600" />
                    ) : module.type === "quiz" ? (
                      <HelpCircle size={16} className="text-slate-600" />
                    ) : module.type === "assignment" ? (
                      <ClipboardList size={16} className="text-slate-600" />
                    ) : (
                      <BookOpen size={16} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-teal-800" : ""
                      }`}
                    >
                      {module.title}
                    </p>
                    {module.duration && (
                      <p className="text-xs text-slate-500">{module.duration}</p>
                    )}
                  </div>
                  {isActive && (
                    <Play size={14} className="text-teal-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Certificate */}
          {currentProgress === 100 && (
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="flex items-center gap-3 mb-2">
                <Award size={24} className="text-teal-600" />
                <h4 className="text-sm font-semibold text-teal-800">
                  Certificate unlocked
                </h4>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                You have completed this course. Download your certificate.
              </p>
              <button className="w-full py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2">
                <Download size={16} />
                Download Certificate
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* AI Mentor Modal */}
      <AIMentorModal
        isOpen={showAIMentor}
        onClose={() => setShowAIMentor(false)}
        courseId={parseInt(course.id)}
        lessonId={activeModule ? parseInt(activeModule.id) : undefined}
        courseTitle={course.title}
        lessonTitle={activeModule?.title}
      />

      {/* AI Quiz Modal — 10 MCQs based on this course / lesson, auto-graded */}
      <AiQuizModal
        isOpen={showAiQuiz}
        onClose={() => setShowAiQuiz(false)}
        courseTitle={course.title}
        courseId={course.id}
        lessonTitle={activeModule?.title}
      />

      {/* Instructor-created quiz (take & auto-grade) */}
      {takeQuizId != null && (
        <TakeInstructorQuizModal
          isOpen={true}
          onClose={() => { setTakeQuizId(null); setTakeQuizTitle(""); }}
          quizId={takeQuizId}
          quizTitle={takeQuizTitle}
        />
      )}

      {/* Course module quiz */}
      {activeModule?.type === "quiz" && (
        <CourseModuleQuizModal
          isOpen={showModuleQuiz}
          onClose={() => setShowModuleQuiz(false)}
          onPass={() => {
            markModuleComplete(activeModule.id);
            setShowModuleQuiz(false);
          }}
          courseTitle={course.title}
          moduleTitle={activeModule.title.replace(/ - Quiz$/, "")}
          topics={
            activeModule.id.includes("m5") || activeModule.title.includes("HTML")
              ? "HTML structure, tags, forms, inputs, semantic elements, CSS basics"
              : activeModule.id.includes("m4") || activeModule.title.includes("JavaScript")
                ? "JavaScript variables, functions, arrays, objects, DOM manipulation, events"
                : activeModule.title.replace(/ - Quiz$/, "")
          }
        />
      )}
    </div>
  );
}

/** Resource card: primary = View in LMS (opens in-app); secondary = Download */
function ResourceCard({
  label,
  fileUrl,
  type,
}: {
  label: string;
  fileUrl: string;
  type: "pdf" | "ppt";
}) {
  const viewerUrl = `/dashboard/learner/viewer?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(label)}&type=${type}`;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 transition">
      <FileText size={20} className="text-teal-600 flex-shrink-0" />
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <Link
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition"
        >
          <BookOpen size={14} />
          View in LMS
        </Link>
        <a
          href={fileUrl}
          download
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
        >
          <Download size={14} />
          Download
        </a>
      </div>
    </div>
  );
}

