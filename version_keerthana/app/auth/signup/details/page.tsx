"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function SignupDetailsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const emailFromUrl = params.get("email") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-6 text-slate-900 text-center">
          Sign up / Create your account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            value={emailFromUrl}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-500"
          />

          <input
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 pr-12 focus:outline-none focus:ring-2 focus:ring-[#008080]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500"
            >
              👁
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#008080] hover:bg-[#006666] text-white py-3 rounded-xl font-medium transition"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-[#008080] font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>}>
      <SignupDetailsContent />
    </Suspense>
  );
}
