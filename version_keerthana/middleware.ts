import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only run role-based redirect for NextAuth users hitting the generic dashboard entry
  if (path === "/dashboard" || path === "/dashboard/") {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const status = (token?.status as string) ?? "active";
    const role = token?.role != null ? String(token.role).toUpperCase() : null;

    // Revoked: show pending page (it will display "access revoked" message)
    if (status === "revoked") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }
    // New account or awaiting approval: show pending page until admin assigns role
    if (status === "pending" || role === "PENDING") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }
    // Existing LMS user with access: go straight to their dashboard
    if (role === "LEARNER") {
      return NextResponse.redirect(new URL("/dashboard/learner", req.url));
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    if (role === "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard/manager", req.url));
    }
    if (role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/dashboard/instructor", req.url));
    }
  }

  // Restrict admin-only routes to admin role (course publish requests, user approval, etc.)
  if (path.startsWith("/dashboard/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const role = token?.role != null ? String(token.role).toUpperCase() : null;
    if (role !== "ADMIN") {
      if (role === "MANAGER") {
        return NextResponse.redirect(new URL("/dashboard/manager", req.url));
      }
      if (role === "INSTRUCTOR") {
        return NextResponse.redirect(new URL("/dashboard/instructor", req.url));
      }
      if (role === "LEARNER") {
        return NextResponse.redirect(new URL("/dashboard/learner", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
