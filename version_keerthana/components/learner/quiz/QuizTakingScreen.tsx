"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import QuizInstructionsModal from "./QuizInstructionsModal";
import QuizSubmissionModal from "./QuizSubmissionModal";
import type { QuizConfig, QuizQuestion } from "@/data/quizData";

type Props = {
  quiz: QuizConfig;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizTakingScreen({ quiz }: Props) {
  const router = useRouter();
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmission, setShowSubmission] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMinutes * 60);
  const [startedAt] = useState(() => new Date().toISOString());
  const [isTimerWarning, setIsTimerWarning] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const handleStartQuiz = useCallback(() => {
    setShowInstructions(false);
  }, []);

  useEffect(() => {
    if (showInstructions) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowSubmission(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showInstructions]);

  useEffect(() => {
    setIsTimerWarning(timeLeft <= 120 && timeLeft > 0);
  }, [timeLeft]);

  const handleAnswer = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMulti) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowSubmission(true);
    }
  };

  const handleSubmit = () => {
    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
    let correctPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    quiz.questions.forEach((q) => {
      const selected = answers[q.id] ?? [];
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        selected.length === correctIds.length &&
        selected.every((id) => correctIds.includes(id));
      if (isCorrect) {
        correctPoints += q.points;
        correctCount++;
      } else if (selected.length > 0) {
        incorrectCount++;
      }
    });

    const score = totalPoints > 0 ? Math.round((correctPoints / totalPoints) * 100) : 0;
    const unansweredCount = totalQuestions - correctCount - incorrectCount;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `quiz-${quiz.id}-answers`,
        JSON.stringify(answers)
      );
    }

    router.push(
      `/dashboard/learner/quiz/${quiz.id}/result?score=${score}&correct=${correctCount}&incorrect=${incorrectCount}&unanswered=${unansweredCount}&total=${totalQuestions}`
    );
  };

  if (showInstructions) {
    return (
      <QuizInstructionsModal
        isOpen={true}
        onClose={() => router.push(`/dashboard/learner/quiz/${quiz.id}`)}
        onConfirm={handleStartQuiz}
        rules={[
          "Answer all questions before submitting.",
          "You can navigate between questions using Previous and Next.",
          "The quiz will auto-submit when time expires.",
          "Complete this quiz independently with integrity.",
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href={`/dashboard/learner/quiz/${quiz.id}`}
                className="text-slate-500 hover:text-slate-700 flex-shrink-0"
                aria-label="Exit quiz"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-semibold text-slate-800 truncate">
                  {quiz.title}
                </h1>
                <p className="text-sm text-slate-500">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-shrink-0 ${
                isTimerWarning ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="font-mono font-semibold tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Question area */}
          <div className="flex-1 min-w-0">
            <QuestionContent
              question={currentQuestion}
              answers={answers[currentQuestion.id] ?? []}
              onAnswer={(optionId) =>
                handleAnswer(
                  currentQuestion.id,
                  optionId,
                  currentQuestion.type === "multi"
                )
              }
            />
          </div>

          {/* Question navigation panel */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-1">
                {quiz.questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-8 h-8 rounded text-xs font-medium transition ${
                      i === currentIndex
                        ? "bg-teal-600 text-white"
                        : answers[q.id]?.length
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
          >
            {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Save & Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <QuizSubmissionModal
        isOpen={showSubmission}
        onClose={() => setShowSubmission(false)}
        onConfirm={handleSubmit}
        answeredCount={answeredCount}
        totalCount={totalQuestions}
        unansweredCount={totalQuestions - answeredCount}
      />
    </div>
  );
}

function QuestionContent({
  question,
  answers,
  onAnswer,
}: {
  question: QuizQuestion;
  answers: string[];
  onAnswer: (optionId: string) => void;
}) {
  const isMulti = question.type === "multi";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {question.scenario && (
        <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-sm font-medium text-slate-600 mb-1">Scenario</p>
          <p className="text-slate-700">{question.scenario}</p>
        </div>
      )}
      <h2 className="text-lg font-medium text-slate-800 mb-4">
        {question.question}
      </h2>
      {question.codeSnippet && (
        <pre className="mb-4 p-4 rounded-lg bg-slate-900 text-slate-100 text-sm overflow-x-auto font-mono">
          {question.codeSnippet}
        </pre>
      )}
      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = answers.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                isSelected
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type={isMulti ? "checkbox" : "radio"}
                name={question.id}
                checked={isSelected}
                onChange={() => onAnswer(opt.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
