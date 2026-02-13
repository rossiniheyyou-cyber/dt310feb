"use client";

import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";
import ReadinessScoreRing from "@/components/learner/dashboard/ReadinessScoreRing";
import SkillDistributionRing from "@/components/learner/dashboard/SkillDistributionRing";
import DailyStreakChart from "@/components/learner/dashboard/DailyStreakChart";
import ContinueLearningSection from "@/components/learner/dashboard/ContinueLearningSection";
import UpcomingTasksSection from "@/components/learner/dashboard/UpcomingTasksSection";
import RecentActivitySection from "@/components/learner/dashboard/RecentActivitySection";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeHeader />

      {/* Continue Learning / Browse Courses - FIRST (before readiness) */}
      <ContinueLearningSection />

      {/* Readiness + Daily Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ReadinessScoreRing />
        <DailyStreakChart />
      </div>

      {/* Skill Distribution - right below Readiness & Daily Streak */}
      <SkillDistributionRing />

      {/* Upcoming Tasks */}
      <UpcomingTasksSection />

      {/* Recent Learning Activity */}
      <RecentActivitySection />
    </div>
  );
}
