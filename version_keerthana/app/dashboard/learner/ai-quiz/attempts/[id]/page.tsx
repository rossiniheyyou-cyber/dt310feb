"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, HelpCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getAiQuizAttemptById, type AiQuizAttemptDetail } from "@/lib/api/aiQuiz";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AiQuizAttemptDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [attempt, setAttempt] = useState<AiQuizAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError("Invalid attempt id");
      setLoading(false);
      return;
    }
    let cancelled = false;
    getAiQuizAttemptById(id)
      .then((data) => {
        if (!cancelled) setAttempt(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || "Failed to load attempt");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center gap-2 text-slate-600">
        <Loader2 size={24} className="animate-spin" />
        Loading…
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600 mb-4">{error || "Attempt not found"}</p>
        <Link
          href="/dashboard/learner/ai-quiz/attempts"
          className="inline-flex items-center gap-2 text-teal-600 font-medium"
        >
          <ArrowLeft size={18} />
          Back to attempts
        </Link>
      </div>
    );
  }

  const questions = attempt.questionsSnapshot || [];
  const answers = attempt.answersSnapshot || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <Link
          href="/dashboard/learner/ai-quiz/attempts"
          className="inline-flex items-center gap-2 text-teal-600 font-medium mb-6 hover:text-teal-700"
        >
          <ArrowLeft size={18} />
          Back to attempts
        </Link>

        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle size={28} className="text-teal-600" />
              Quiz attempt
            </h1>
            <p className="text-slate-600 mt-1">
              {attempt.courseTitle}
              {attempt.lessonTitle ? ` — ${attempt.lessonTitle}` : ""}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatDate(attempt.createdAt)} · {attempt.difficulty}
            </p>
          </div>
          {attempt.status === "completed" && attempt.score !== null && (
            <div className="text-2xl font-bold text-teal-600">
              {attempt.score} / {attempt.totalQuestions}
            </div>
          )}
        </div>

        {attempt.feedbackText && (
          <div className="mb-8 p-4 rounded-xl bg-teal-50 border border-teal-200">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Where to improve</h2>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{attempt.feedbackText}</p>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, i) => {
            const userChoice = answers[i];
            const correct = q.correctAnswerIndex;
            const isCorrect = userChoice === correct;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect ? "border-teal-200 bg-teal-50/30" : "border-amber-200 bg-amber-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle size={20} className="text-teal-600" />
                    ) : (
                      <XCircle size={20} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 mb-2">
                      {i + 1}. {q.questionText}
                    </p>
                    <ul className="space-y-1">
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={`text-sm ${
                            j === correct
                              ? "text-teal-700 font-medium"
                              : j === userChoice && !isCorrect
                              ? "text-amber-700"
                              : "text-slate-600"
                          }`}
                        >
                          {opt}
                          {j === correct && " (correct)"}
                          {j === userChoice && !isCorrect && j !== correct && " (your answer)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
