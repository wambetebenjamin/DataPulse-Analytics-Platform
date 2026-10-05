import type { DefaultSession } from "next-auth";
import type { Role } from "@/data/analytics";

/**
 * Augment the NextAuth session so `session.user.role` is typed everywhere
 * rather than cast at each call site.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organisation: string;
      plan: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    organisation?: string;
    plan?: string;
  }
}
