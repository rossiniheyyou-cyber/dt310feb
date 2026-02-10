"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AuthPendingPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">You are not signed in.</p>
          <Link
            href="/auth/login"
            className="text-teal-600 font-medium hover:underline"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const status = (session.user as { status?: string })?.status;
  const isRevoked = status === "revoked";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/digitalt3-logo.png"
              alt="DigitalT3"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          {isRevoked ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Access revoked
              </h1>
              <p className="text-slate-600 mb-6">
                Your access to the LMS has been revoked. If you believe this is
                an error, please contact your administrator.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Account created
              </h1>
              <p className="text-slate-600 mb-6">
                Your account is created. Please wait for an Admin to assign your
                role (Manager/Instructor/Learner). You will then be able to
                access the dashboard.
              </p>
            </>
          )}
          <p className="text-sm text-slate-500 mb-8">
            Signed in as <span className="font-medium text-slate-700">{session.user?.email}</span>
          </p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
