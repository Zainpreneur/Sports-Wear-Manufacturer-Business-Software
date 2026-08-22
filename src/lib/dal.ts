import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decryptSession, readSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

/**
 * Verifies the session cookie for the current request. Memoized with
 * React's cache() so multiple Server Components in one render pass share a
 * single decrypt. Does NOT redirect — callers decide what to do.
 */
export const getSession = cache(async () => {
  const token = await readSessionCookie();
  return decryptSession(token);
});

/** Redirects to /login if there is no valid session. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Redirects unless the current user's role is one of `roles`. */
export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return session;
}

/**
 * Loads the full, live User row for the current session (and confirms the
 * account is still active) — the "secure" check for data mutations, as
 * opposed to the optimistic cookie-only check used in proxy.ts.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active) return null;
  return user;
});
