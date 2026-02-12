import WelcomeCard from "@/components/learner/WelcomeCard";
import ReadinessOverviewCard from "@/components/learner/ReadinessOverviewCard";
import ContinueLearning from "@/components/learner/ContinueLearning";
import UpcomingTasks from "@/components/learner/UpcomingTasks";
import LearningPathStepper from "@/components/learner/LearningPathStepper";
import AIMentorCard from "@/components/learner/AIMentorCard";
import ProgressCharts from "@/components/learner/ProgressCharts";
import LearningProgressSummary from "@/components/learner/LearningProgressSummary";
import MandatoryCourses from "@/components/learner/MandatoryCourses";
import SkillsOverview from "@/components/learner/SkillsOverview";
import CertificatesSnapshot from "@/components/learner/CertificatesSnapshot";
import RecentActivity from "@/components/learner/RecentActivity";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeCard />

      {/* Continue Learning (Top Priority) */}
      <ContinueLearning />

      {/* Readiness / Skill Readiness Score */}
      <ReadinessOverviewCard />

      {/* Learning Progress Summary - KPI Cards */}
      <LearningProgressSummary />

      {/* Tasks + Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks />
        <LearningPathStepper />
      </div>

      {/* Assigned & Mandatory Courses */}
      <MandatoryCourses />

      {/* Skills & Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillsOverview />
        <CertificatesSnapshot />
      </div>

      {/* AI + Analytics + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIMentorCard />
        <ProgressCharts />
      </div>

      {/* Recent Learning Activity */}
      <RecentActivity />
    </div>
  );
}
