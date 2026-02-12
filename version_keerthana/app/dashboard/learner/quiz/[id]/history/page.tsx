import Link from "next/link";
import { getQuizConfig } from "@/data/quizData";
import QuizHistoryScreen from "@/components/learner/quiz/QuizHistoryScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuizHistoryPage({ params }: Props) {
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

  return <QuizHistoryScreen quiz={quiz} />;
}
