import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "@/lib/auth-cookie";

const PROTECTED_PREFIXES = [
  "/director",
  "/assistant",
  "/dashboard",
];

const AUTH_ONLY_PATHS = ["/", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. If it's an API route (/api/* or /next-api/*), inject the Bearer token header if present.
  // ─────────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api") || pathname.startsWith("/next-api")) {
    const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    if (token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${token}`);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  }

  // Skip static files, favicon, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const userRaw = request.cookies.get(AUTH_USER_COOKIE)?.value;
  const isAuthenticated = Boolean(token);

  // Check if accessing a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 🔒 Unauthenticated user trying to access protected route → redirect to login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔒 Authenticated but trying to access a route belonging to another role
  if (isAuthenticated && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      const role = user.role; // 'director' or 'assistant'

      if (pathname.startsWith("/director") && role !== "director") {
        // Assistant trying to access director route → redirect to unauthorized or assistant home
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      if (pathname.startsWith("/assistant") && role !== "assistant") {
        // Director trying to access assistant route → redirect to unauthorized or director home
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch {
      // Ignore json parse error
    }
  }

  // Already logged in → skip the login page, go to appropriate dashboard
  if (AUTH_ONLY_PATHS.includes(pathname) && isAuthenticated && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      const destination = user.role === "director" ? "/director" : "/assistant";
      return NextResponse.redirect(new URL(destination, request.url));
    } catch {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
