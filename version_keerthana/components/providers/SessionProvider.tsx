"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { clearCurrentUser, setCurrentUser } from "@/lib/currentUser";

function SyncCurrentUserFromSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      clearCurrentUser();
      return;
    }
    setCurrentUser({
      name: session.user.name || session.user.email,
      email: session.user.email,
      role: (session.user.role as any) || undefined,
    });
  }, [session?.user?.email, session?.user?.name, (session?.user as any)?.role, status]);

  return null;
}

export default function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SyncCurrentUserFromSession />
      {children}
    </NextAuthSessionProvider>
  );
}
