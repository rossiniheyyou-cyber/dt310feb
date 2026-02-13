"use client";

import { useLearnerDashboard } from "@/context/LearnerDashboardContext";
import RoleHeader from "@/components/shared/RoleHeader";

export default function WelcomeHeader() {
  const { data, loading } = useLearnerDashboard();
  const userName = data?.userName ?? "there";
  const isExistingUser = (data?.totalEnrolled ?? 0) > 0;
  const greeting = isExistingUser ? `Welcome back, ${userName}` : `Hello, ${userName}`;
  const subtitle = isExistingUser
    ? "Keep your learning momentum going"
    : "Start your learning journey";

  return (
    <RoleHeader
      greeting={greeting}
      subtitle={subtitle}
      loading={loading}
    />
  );
}
