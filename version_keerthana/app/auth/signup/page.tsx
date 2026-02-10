"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Signup is handled on the login page with full role selection (Learner, Instructor, Manager, Admin).
// Redirect so users always use the correct flow.
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return null;
}
