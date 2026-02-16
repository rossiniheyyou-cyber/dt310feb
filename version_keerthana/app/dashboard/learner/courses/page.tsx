"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearnerCoursesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/learner/courses/my-courses");
  }, [router]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-slate-500 text-sm">Redirecting to My Courses…</p>
    </div>
  );
}
