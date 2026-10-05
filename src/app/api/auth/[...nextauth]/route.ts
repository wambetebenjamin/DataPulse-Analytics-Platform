import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth route handler. Sign-in, sign-out, session and CSRF all live here.
 * Excluded from the sitemap and blocked in robots.txt.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
