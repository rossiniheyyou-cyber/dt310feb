"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRoute, getUserRole, isAuthenticated } from "@/lib/api/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role) {
        router.push(getDashboardRoute(role));
      } else {
        router.push("/dashboard");
      }
    } else {
      // Redirect to login page
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
