import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/auth",
  "/api/auth/login",
  "/api/auth/logout",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check session for protected paths
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/auth/v1/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const loginUrl = new URL("/auth/v1/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add user info to headers for server components
  const response = NextResponse.next();
  response.headers.set("x-user-id", session.userId);
  response.headers.set("x-user-email", session.email);
  response.headers.set("x-user-role", session.role);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
