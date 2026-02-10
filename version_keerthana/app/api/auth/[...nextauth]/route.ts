import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

async function findOrCreateAzureUser(email: string, name: string | null, azureId: string | null) {
  const res = await fetch(`${backendUrl}/auth/azure/find-or-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      email,
      name: name || email,
      azureId: azureId || undefined,
    }),
  });

  const payload = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : `Failed to find or create user (status ${res.status})`;
    throw new Error(message);
  }
  return payload as {
    user: { id: string; role: string; isInternal?: boolean; status?: string };
    token?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "azure-ad" || !user?.email) return true;
      try {
        const azureProfile = profile as { oid?: string; sub?: string };
        const azureId = azureProfile?.oid ?? azureProfile?.sub ?? null;
        const data = await findOrCreateAzureUser(
          user.email,
          user.name ?? null,
          azureId
        );
        (user as Record<string, unknown>).backendUserId = data.user.id;
        (user as Record<string, unknown>).role = data.user.role;
        (user as Record<string, unknown>).isInternal = data.user.isInternal;
        (user as Record<string, unknown>).status = data.user.status ?? "active";
        (user as Record<string, unknown>).backendAccessToken = data.token ?? null;
        return true;
      } catch (e) {
        console.error("Azure find-or-create error:", e);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const userLike = user as Record<string, unknown>;
        token.backendUserId =
          typeof userLike.backendUserId === "string" ? userLike.backendUserId : undefined;
        token.role = typeof userLike.role === "string" ? userLike.role : undefined;
        token.isInternal =
          typeof userLike.isInternal === "boolean" ? userLike.isInternal : undefined;
        token.status =
          userLike.status === "pending" || userLike.status === "revoked" || userLike.status === "active"
            ? userLike.status
            : "active";
        token.backendAccessToken =
          typeof userLike.backendAccessToken === "string" ? userLike.backendAccessToken : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.backendUserId;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).isInternal = token.isInternal;
        (session.user as Record<string, unknown>).status = token.status ?? "active";
        (session.user as Record<string, unknown>).backendAccessToken = token.backendAccessToken ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
