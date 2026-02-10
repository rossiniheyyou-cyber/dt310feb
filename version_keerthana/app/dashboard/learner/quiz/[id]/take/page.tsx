import Link from "next/link";
import { getQuizConfig, getQuizAttempts } from "@/data/quizData";
import QuizTakingScreen from "@/components/learner/quiz/QuizTakingScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuizTakePage({ params }: Props) {
  const { id } = await params;
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

  const attempts = getQuizAttempts(quiz.id);
  const canRetake = attempts.length < quiz.attemptLimit;

  if (!canRetake) {
    return (
      <div className="max-w-4xl p-8">
        <p className="text-slate-600">
          You have reached the maximum number of attempts for this quiz.
        </p>
        <Link
          href={`/dashboard/learner/quiz/${quiz.id}`}
          className="text-teal-600 font-medium mt-4 inline-block"
        >
          ← Back to Quiz
        </Link>
      </div>
    );
  }

  return <QuizTakingScreen quiz={quiz} />;
}
