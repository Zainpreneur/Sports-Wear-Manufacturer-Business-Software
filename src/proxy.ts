import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

// Next.js 16 renamed Middleware to Proxy (functionality is unchanged).
// This only does an *optimistic* cookie check to bounce anonymous visitors
// away from the app and logged-in visitors away from /login. The real,
// database-backed authorization check lives in the DAL (src/lib/dal.ts) and
// runs again in every server component / server action that touches data.
const PUBLIC_PATHS = ["/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const cookie = req.cookies.get("session")?.value;
  const session = await decryptSession(cookie);

  if (!isPublic && pathname !== "/" && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublic && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
