import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    backendUserId?: string;
    role?: string;
    isInternal?: boolean;
    status?: "pending" | "active" | "revoked";
    backendAccessToken?: string | null;
  }

  interface Session {
    user: User & {
      id?: string;
      role?: string;
      isInternal?: boolean;
      status?: "pending" | "active" | "revoked";
      backendAccessToken?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendUserId?: string;
    role?: string;
    isInternal?: boolean;
    status?: "pending" | "active" | "revoked";
    backendAccessToken?: string | null;
  }
}
