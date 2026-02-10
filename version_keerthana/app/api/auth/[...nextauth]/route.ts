import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

async function findOrCreateAzureUser(email: string, name: string | null, azureId: string | null) {
  const res = await fetch(`${backendUrl}/auth/azure/find-or-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      name: name || email,
      azureId: azureId || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to find or create user");
  }
  return res.json();
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
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
        token.backendUserId = (user as Record<string, unknown>).backendUserId;
        token.role = (user as Record<string, unknown>).role;
        token.isInternal = (user as Record<string, unknown>).isInternal;
        token.status = (user as Record<string, unknown>).status ?? "active";
        token.backendAccessToken = (user as Record<string, unknown>).backendAccessToken ?? null;
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
