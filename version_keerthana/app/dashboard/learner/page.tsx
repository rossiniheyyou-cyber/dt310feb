"use client";

import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";
import ReadinessScoreRing from "@/components/learner/dashboard/ReadinessScoreRing";
import SkillDistributionRing from "@/components/learner/dashboard/SkillDistributionRing";
import DailyStreakChart from "@/components/learner/dashboard/DailyStreakChart";
import ContinueLearningSection from "@/components/learner/dashboard/ContinueLearningSection";
import UpcomingTasksSection from "@/components/learner/dashboard/UpcomingTasksSection";
import RecentActivitySection from "@/components/learner/dashboard/RecentActivitySection";
import LearningStatsCards from "@/components/learner/dashboard/LearningStatsCards";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeHeader />

      {/* Stats: enrolled, in progress, completed, hours, streak */}
      <LearningStatsCards />

      {/* Continue Learning / Browse Courses */}
      <ContinueLearningSection />

      {/* Readiness + Skill Distribution - side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ReadinessScoreRing />
        <SkillDistributionRing />
      </div>

      {/* Daily Streak - below */}
      <DailyStreakChart />

      {/* Upcoming Tasks */}
      <UpcomingTasksSection />

      {/* Recent Learning Activity */}
      <RecentActivitySection />
    </div>
  );
}
