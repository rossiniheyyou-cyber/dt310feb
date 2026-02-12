"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Loader2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import {
  generateAiQuiz,
  submitAiQuiz,
  type AiQuizDifficulty,
  type AiQuizQuestionForTake,
} from "@/lib/api/aiQuiz";

const DIFFICULTIES: { value: AiQuizDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId?: string;
  lessonTitle?: string;
  /** When set, pre-selects difficulty (e.g. from parent page). */
  initialDifficulty?: AiQuizDifficulty;
};

type Step = "difficulty" | "quiz" | "result";

export default function AiQuizModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  lessonTitle,
  initialDifficulty,
}: Props) {
  const [step, setStep] = useState<Step>("difficulty");
  const [difficulty, setDifficulty] = useState<AiQuizDifficulty>(initialDifficulty ?? "medium");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen && initialDifficulty) setDifficulty(initialDifficulty);
  }, [isOpen, initialDifficulty]);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<AiQuizQuestionForTake[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [feedback, setFeedback] = useState<string>("");
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await generateAiQuiz({
        courseId,
        courseTitle,
        lessonTitle,
        difficulty,
      });
      setAttemptId(res.attemptId);
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(-1));
      setCurrentIndex(0);
      setStep("quiz");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSubmit = async () => {
    const filled = answers.map((a) => (a >= 0 && a <= 3 ? a : 0)); // 10 numbers 0-3 (unanswered = 0)
    if (attemptId === null) return;
    setError(null);
    setLoading(true);
    try {
      const res = await submitAiQuiz(attemptId, filled);
      setScore(res.score);
      setTotalQuestions(res.totalQuestions);
      setFeedback(res.feedback);
      setCorrectAnswers(res.correctAnswers);
      setStep("result");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("difficulty");
    setAttemptId(null);
    setQuestions([]);
    setAnswers([]);
    setScore(null);
    setFeedback("");
    setError(null);
    onClose();
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a >= 0).length;
  const canSubmit = questions.length === 10 && answers.every((a) => a >= 0 && a <= 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === "difficulty" && "Take AI Quiz"}
            {step === "quiz" && `AI Quiz (${currentIndex + 1} / 10)`}
            {step === "result" && "Quiz Result"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === "difficulty" && (
            <>
              <p className="text-slate-600 text-sm mb-4">
                Choose difficulty. The AI will generate 10 multiple-choice questions (4 options each) based on this course.
              </p>
              <div className="flex gap-3 mb-6">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition ${
                      difficulty === d.value
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-slate-200 text-slate-700 hover:border-teal-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Start Quiz
                </button>
              </div>
            </>
          )}

          {step === "quiz" && currentQuestion && (
            <>
              <div className="mb-4 flex justify-between text-sm text-slate-500">
                <span>Question {currentIndex + 1} of 10</span>
                <span>{answeredCount} answered</span>
              </div>
              <p className="text-slate-900 font-medium mb-4">{currentQuestion.questionText}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                      answers[currentIndex] === idx
                        ? "border-teal-500 bg-teal-50 text-teal-900"
                        : "border-slate-200 hover:border-teal-200 text-slate-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Submit Quiz
                  </button>
                )}
              </div>
            </>
          )}

          {step === "result" && score !== null && (
            <>
              <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
                  {score >= totalQuestions * 0.7 ? (
                    <CheckCircle size={28} className="text-teal-600" />
                  ) : (
                    <AlertCircle size={28} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {score} / {totalQuestions} correct
                  </p>
                  <p className="text-sm text-slate-600">
                    {score >= totalQuestions * 0.7 ? "Well done!" : "Review the feedback below and try again when ready."}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Where to improve</h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{feedback}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/learner/ai-quiz/attempts"
                  className="px-4 py-2 rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  View my attempts
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
