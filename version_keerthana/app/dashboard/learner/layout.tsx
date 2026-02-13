import LearnerSidebar from "@/components/learner/LearnerSidebar";
import { LearnerProgressProvider } from "@/context/LearnerProgressContext";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearnerProgressProvider>
      <div className="flex min-h-screen">
        <LearnerSidebar />
        <main className="flex-1 ml-64 p-8 bg-slate-50">{children}</main>
      </div>
    </LearnerProgressProvider>
  );
}

