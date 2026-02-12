"use client";

import Link from "next/link";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import type { QuizConfig, QuizQuestion } from "@/data/quizData";

type Props = {
  quiz: QuizConfig;
  answers?: Record<string, string[]>;
  attemptId?: string;
};

export default function QuizReviewScreen({
  quiz,
  answers: initialAnswers,
  attemptId,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>(
    initialAnswers ?? {}
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    quiz.questions[0]?.id ?? null
  );

  useEffect(() => {
    if (Object.keys(initialAnswers ?? {}).length > 0) return;
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`quiz-${quiz.id}-answers`);
      if (stored) {
        try {
          setAnswers(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, [quiz.id, initialAnswers]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href={`/dashboard/learner/quiz/${quiz.id}`}
        className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
      >
        ← Back to Quiz
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Quiz Review</h1>
        <p className="text-slate-500 mt-1">{quiz.title}</p>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <ReviewQuestion
            key={q.id}
            question={q}
            index={i + 1}
            selectedAnswers={answers[q.id] ?? []}
            isExpanded={expandedId === q.id}
            onToggle={() =>
              setExpandedId((id) => (id === q.id ? null : q.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

function ReviewQuestion({
  question,
  index,
  selectedAnswers,
  isExpanded,
  onToggle,
}: {
  question: QuizQuestion;
  index: number;
  selectedAnswers: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
  const isCorrect =
    selectedAnswers.length === correctIds.length &&
    selectedAnswers.every((id) => correctIds.includes(id));

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-4">
          {isCorrect ? (
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-slate-800">
              Question {index}: {question.question}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-100">
          {question.scenario && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50 text-sm text-slate-600">
              <strong>Scenario:</strong> {question.scenario}
            </div>
          )}
          {question.codeSnippet && (
            <pre className="mt-4 p-4 rounded-lg bg-slate-900 text-slate-100 text-sm overflow-x-auto font-mono">
              {question.codeSnippet}
            </pre>
          )}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">Your answer:</p>
            <p className="text-sm text-slate-600">
              {selectedAnswers.length > 0
                ? question.options
                    .filter((o) => selectedAnswers.includes(o.id))
                    .map((o) => o.text)
                    .join(", ")
                : "No answer selected"}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">Correct answer:</p>
            <p className="text-sm text-slate-600">
              {question.options
                .filter((o) => o.isCorrect)
                .map((o) => o.text)
                .join(", ")}
            </p>
          </div>
          {question.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-teal-50 border border-teal-100">
              <p className="text-sm font-medium text-teal-800">Explanation</p>
              <p className="text-sm text-teal-700 mt-1">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
