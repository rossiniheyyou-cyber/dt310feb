import Link from "next/link";
import { getQuizConfig, getQuizAttempts } from "@/data/quizData";
import QuizResultScreen from "@/components/learner/quiz/QuizResultScreen";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ score?: string; correct?: string; incorrect?: string; unanswered?: string; total?: string }>;
};

export default async function QuizResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const quiz = getQuizConfig(id);

  if (!quiz) {
    return (
      <div className="max-w-4xl p-8">
        <p className="text-slate-600">Quiz not found.</p>
        <Link
          href="/dashboard/learner/assignments"
          className="text-teal-600 font-medium mt-4 inline-block"
        >
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  const score = parseInt(sp.score ?? "0", 10);
  const correctCount = parseInt(sp.correct ?? "0", 10);
  const incorrectCount = parseInt(sp.incorrect ?? "0", 10);
  const unansweredCount = parseInt(sp.unanswered ?? "0", 10);
  const totalQuestions = parseInt(sp.total ?? String(quiz.questionCount), 10);

  const attempts = getQuizAttempts(quiz.id);
  const canRetake = attempts.length < quiz.attemptLimit;

  return (
    <QuizResultScreen
      quiz={quiz}
      score={score}
      correctCount={correctCount}
      incorrectCount={incorrectCount}
      unansweredCount={unansweredCount}
      totalQuestions={totalQuestions}
      canRetake={canRetake}
    />
  );
}
