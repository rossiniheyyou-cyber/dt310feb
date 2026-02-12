import Link from "next/link";
import { getQuizConfig, getQuizAttemptById } from "@/data/quizData";
import QuizReviewScreen from "@/components/learner/quiz/QuizReviewScreen";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export default async function QuizReviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;
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

  const attempt = attemptId ? getQuizAttemptById(id, attemptId) : undefined;

  return (
    <QuizReviewScreen
      quiz={quiz}
      answers={attempt?.answers}
      attemptId={attemptId}
    />
  );
}
