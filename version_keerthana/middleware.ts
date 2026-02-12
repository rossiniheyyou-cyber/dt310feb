import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const status = (token?.status as string) ?? "active";
  const role = token?.role != null ? String(token.role).toUpperCase() : null;
  const roleToSegment: Record<string, string> = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSTRUCTOR: "instructor",
    LEARNER: "learner",
  };
  const roleSegment = role ? roleToSegment[role] : undefined;

  // Only run role-based redirect for NextAuth users hitting the generic dashboard entry
  if (path === "/dashboard" || path === "/dashboard/") {
    // Revoked: show pending page (it will display "access revoked" message)
    if (status === "revoked") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }
    // New account or awaiting approval: show pending page until admin assigns role
    if (status === "pending" || role === "PENDING") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }
    // Existing LMS user with access: go straight to their dashboard
    if (roleSegment) {
      return NextResponse.redirect(new URL(`/dashboard/${roleSegment}`, req.url));
    }
  }

  // NextAuth role guard: keep users in their own role-scoped dashboard routes.
  if (token && roleSegment) {
    // Pending/revoked users cannot access dashboard routes.
    if (status === "revoked" || status === "pending" || role === "PENDING") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }

    // Redirect generic shared calendar/notifications routes into role-scoped routes.
    if (path === "/dashboard/calendar") {
      return NextResponse.redirect(new URL(`/dashboard/${roleSegment}/calendar`, req.url));
    }
    if (path === "/dashboard/notifications") {
      return NextResponse.redirect(new URL(`/dashboard/${roleSegment}/notifications`, req.url));
    }

    const guardedSegments = ["admin", "manager", "instructor", "learner"] as const;
    const wrongSegment = guardedSegments.find(
      (segment) => path.startsWith(`/dashboard/${segment}`) && segment !== roleSegment
    );
    if (wrongSegment) {
      return NextResponse.redirect(new URL(`/dashboard/${roleSegment}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
