import { createHash, timingSafeEqual } from "node:crypto";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { ROLE_TABS, team, type Role } from "@/data/analytics";

/**
 * Authentication.
 *
 * Credentials provider with a JWT session, because the platform has no
 * database in this build — demo accounts live in src/data/analytics.ts and the
 * role on the token is what every page and API route checks.
 *
 * In production this provider is swapped for a database lookup; the contract
 * (`session.user.role`) stays identical, so nothing downstream changes.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisation: string;
  plan: string;
}

/** Demo password, overridable per environment. Never a real credential. */
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD ?? "datapulse2026";

function constantTimeEquals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-only-insecure-secret-change-me",
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Work email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const member = team.find(
          (m) => m.email.toLowerCase() === email && m.status === "Active"
        );
        if (!member) return null;
        if (!constantTimeEquals(password, DEMO_PASSWORD)) return null;

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          organisation: "Sokoni Retail Group",
          plan: "Business",
        } as unknown as SessionUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser;
        token.role = u.role;
        token.organisation = u.organisation;
        token.plan = u.plan;
        token.uid = u.id;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as JWT & {
        role?: Role;
        organisation?: string;
        plan?: string;
        uid?: string;
      };
      if (session.user) {
        (session.user as Session["user"] & Partial<SessionUser>).id = t.uid ?? "";
        (session.user as Session["user"] & Partial<SessionUser>).role = t.role ?? "Viewer";
        (session.user as Session["user"] & Partial<SessionUser>).organisation =
          t.organisation ?? "";
        (session.user as Session["user"] & Partial<SessionUser>).plan = t.plan ?? "Starter";
      }
      return session;
    },
  },
};

/** Current session user, or null. Server components and route handlers only. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as (Session["user"] & Partial<SessionUser>) | undefined;
  if (!user?.email) return null;
  return {
    id: user.id ?? "",
    name: user.name ?? "",
    email: user.email,
    role: (user.role as Role) ?? "Viewer",
    organisation: user.organisation ?? "",
    plan: user.plan ?? "Starter",
  };
}

/** Role gate used by every dashboard tab and every protected API route. */
export function canAccessTab(role: Role, tab: string): boolean {
  return ROLE_TABS[role]?.includes(tab) ?? false;
}

const WRITE_ROLES: Role[] = ["Owner", "Manager"];
const ADMIN_ROLES: Role[] = ["Owner"];

export function canWrite(role: Role): boolean {
  return WRITE_ROLES.includes(role);
}

export function canAdminister(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Guard for API route handlers.
 * Returns the user, or a Response to return immediately.
 */
export async function requireUser(
  options: { tab?: string; write?: boolean; admin?: boolean } = {}
): Promise<{ user: SessionUser } | { response: Response }> {
  const user = await currentUser();
  if (!user) {
    return {
      response: Response.json(
        { ok: false, error: "Sign in to continue." },
        { status: 401 }
      ),
    };
  }
  if (options.tab && !canAccessTab(user.role, options.tab)) {
    return {
      response: Response.json(
        { ok: false, error: `Your ${user.role} role cannot view ${options.tab}.` },
        { status: 403 }
      ),
    };
  }
  if (options.write && !canWrite(user.role)) {
    return {
      response: Response.json(
        { ok: false, error: `Your ${user.role} role is read-only here.` },
        { status: 403 }
      ),
    };
  }
  if (options.admin && !canAdminister(user.role)) {
    return {
      response: Response.json(
        { ok: false, error: "Only the workspace Owner can do that." },
        { status: 403 }
      ),
    };
  }
  return { user };
}
