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
    const rolesCookie = req.cookies.get("user-roles")?.value;
    if (!rolesCookie) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    try {
      const roles: string[] = JSON.parse(rolesCookie);
      const isAdmin = roles.includes("super-admin") || roles.includes("product-manager");
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/library", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
}