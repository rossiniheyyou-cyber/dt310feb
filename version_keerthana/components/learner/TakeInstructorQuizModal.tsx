"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronLeft, ChevronRight, Award, AlertCircle } from "lucide-react";
import {
  getQuizForTake,
  submitQuiz,
  type QuizQuestionForTake,
} from "@/lib/api/quizzes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  quizId: number;
  quizTitle: string;
};

type Step = "loading" | "quiz" | "result";

export default function TakeInstructorQuizModal({
  isOpen,
  onClose,
  quizId,
  quizTitle,
}: Props) {
  const [step, setStep] = useState<Step>("loading");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionForTake[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen || !quizId) return;
    setStep("loading");
    setError(null);
    setQuestions([]);
    setAnswers([]);
    setScore(null);
    getQuizForTake(quizId)
      .then((data) => {
        setQuestions(data.questions || []);
        setAnswers(new Array((data.questions || []).length).fill(-1));
        setTotalQuestions(data.totalQuestions || 10);
        setStep("quiz");
        setCurrentIndex(0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load quiz");
        setStep("quiz");
      });
  }, [isOpen, quizId]);

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    const filled = answers.map((a) => (a >= 0 && a <= 3 ? a : 0));
    setError(null);
    setLoading(true);
    try {
      const res = await submitQuiz(quizId, filled);
      setScore(res.score);
      setTotalQuestions(res.totalQuestions);
      setCorrectAnswers(res.correctAnswers || []);
      setStep("result");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a >= 0).length;
  const canSubmit = questions.length === totalQuestions && answers.every((a) => a >= 0 && a <= 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === "loading" && "Loading quiz…"}
            {step === "quiz" && `Quiz: ${quizTitle} (${currentIndex + 1} / ${questions.length})`}
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
          {step === "loading" && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          )}

          {step === "quiz" && currentQuestion && (
            <>
              <div className="mb-4 flex justify-between text-sm text-slate-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
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
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                  >
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
                    Submit
                  </button>
                )}
              </div>
            </>
          )}

          {step === "result" && score !== null && (
            <>
              <div className="flex items-center justify-center gap-2 py-4">
                <Award size={32} className="text-teal-600" />
                <span className="text-2xl font-bold text-slate-900">
                  {score} / {totalQuestions}
                </span>
              </div>
              <p className="text-slate-600 text-center text-sm mb-6">
                All quizzes are auto-graded. Review your answers below if needed.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                >
                  Close
                </button>
              </div>
            </>
          )}

          {step === "quiz" && questions.length === 0 && !error && (
            <p className="text-slate-500 text-center py-8">No questions in this quiz.</p>
          )}
        </div>
      </div>
    </div>
  );
}
