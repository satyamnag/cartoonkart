// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Allow Payload's own login page and API routes to pass through
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/admin/api") ||
      pathname.startsWith("/admin/_next")
    ) {
      return NextResponse.next();
    }

    const rolesCookie = req.cookies.get("user-roles")?.value;
    if (!rolesCookie) {
      // Not authenticated yet – redirect to Payload's login page
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const roles: string[] = JSON.parse(rolesCookie);
      const isAdmin = roles.includes("super-admin") || roles.includes("product-manager");
      if (!isAdmin) {
        // Authenticated but not an admin – send to library
        return NextResponse.redirect(new URL("/library", req.url));
      }
    } catch {
      // Corrupted cookie – redirect to login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}