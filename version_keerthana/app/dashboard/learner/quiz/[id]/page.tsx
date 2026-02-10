import Link from "next/link";
import { getQuizConfig, getQuizAttempts } from "@/data/quizData";
import QuizLandingScreen from "@/components/learner/quiz/QuizLandingScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuizLandingPage({ params }: Props) {
  const { id } = await params;
  const quiz = getQuizConfig(id);

  if (!quiz) {
    return (
      <div className="max-w-4xl">
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

  const attempts = getQuizAttempts(quiz.id);
  const attemptCount = attempts.length;
  const canRetake = attemptCount < quiz.attemptLimit;

  return (
    <QuizLandingScreen
      quiz={quiz}
      attemptCount={attemptCount}
      canRetake={canRetake}
    />
  );
}
