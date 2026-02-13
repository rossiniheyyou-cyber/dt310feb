import LearnerLayoutClient from "@/components/learner/LearnerLayoutClient";
import { LearnerProgressProvider } from "@/context/LearnerProgressContext";
import { LearnerDashboardProvider } from "@/context/LearnerDashboardContext";
import { LearnerProgressPageProvider } from "@/context/LearnerProgressPageContext";
import { LearnerAssignmentsProvider } from "@/context/LearnerAssignmentsContext";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearnerProgressProvider>
      <LearnerDashboardProvider>
        <LearnerProgressPageProvider>
          <LearnerAssignmentsProvider>
            <LearnerLayoutClient>{children}</LearnerLayoutClient>
          </LearnerAssignmentsProvider>
        </LearnerProgressPageProvider>
      </LearnerDashboardProvider>
    </LearnerProgressProvider>
  );
}

