"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { generateAiQuiz, submitAiQuiz } from "@/lib/api/aiQuiz";

const PASS_THRESHOLD = 5;
const TOTAL_QUESTIONS = 10;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPass: () => void;
  courseTitle: string;
  moduleTitle: string;
  topics: string;
};

type Step = "start" | "loading" | "quiz" | "result";

export default function CourseModuleQuizModal({
  isOpen,
  onClose,
  onPass,
  courseTitle,
  moduleTitle,
  topics,
}: Props) {
  const [step, setStep] = useState<Step>("start");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<{ questionText: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    setStep("loading");
    try {
      const res = await generateAiQuiz({
        courseTitle,
        lessonTitle: topics,
        difficulty: "medium",
      });
      setAttemptId(res.attemptId);
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(-1));
      setCurrentIndex(0);
      setStep("quiz");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || "Failed to start quiz");
      setStep("start");
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

  const handleSubmit = async () => {
    if (attemptId === null) return;
    const filled = answers.map((a) => (a >= 0 && a <= 3 ? a : 0));
    setError(null);
    setLoading(true);
    try {
      const res = await submitAiQuiz(attemptId, filled);
      setScore(res.score);
      setFeedback(res.feedback);
      setStep("result");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setStep("start");
    setAttemptId(null);
    setQuestions([]);
    setAnswers([]);
    setScore(null);
    setFeedback("");
    setError(null);
  };

  const handleClose = () => {
    onClose();
  };

  const passed = score !== null && score >= PASS_THRESHOLD;
  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a >= 0).length;
  const canSubmit = questions.length === TOTAL_QUESTIONS && answers.every((a) => a >= 0 && a <= 3);

  useEffect(() => {
    if (!isOpen) {
      setStep("start");
      setAttemptId(null);
      setQuestions([]);
      setAnswers([]);
      setScore(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === "start" && moduleTitle}
            {step === "loading" && "Loading quiz…"}
            {step === "quiz" && `${moduleTitle} (${currentIndex + 1} / ${TOTAL_QUESTIONS})`}
            {step === "result" && "Quiz Result"}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === "start" && (
            <>
              <p className="text-slate-600 text-sm mb-4">
                This quiz has 10 questions. Complete all to submit.
              </p>
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

          {step === "loading" && (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          )}

          {step === "quiz" && currentQuestion && (
            <>
              <div className="mb-4 flex justify-between text-sm text-slate-500">
                <span>Question {currentIndex + 1} of {TOTAL_QUESTIONS}</span>
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
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => i + 1)}
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
              <div className="flex items-center gap-4 mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
                  {passed ? (
                    <CheckCircle size={32} className="text-teal-600" />
                  ) : (
                    <AlertCircle size={32} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {score} / {TOTAL_QUESTIONS} correct
                  </p>
                  <p className="text-sm text-slate-600">
                    {passed ? "You passed!" : "Not passed yet."}
                  </p>
                </div>
              </div>
              {feedback && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Feedback</h3>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{feedback}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {passed ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onPass();
                        handleClose();
                      }}
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Continue to next section
                    </button>
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Try again
                    </button>
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                      Close
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
