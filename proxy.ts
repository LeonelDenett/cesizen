import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/reset-password/confirm",
];

// Path prefixes that are always public
const publicPrefixes = ["/info/", "/api/auth/"];

// Path prefixes that require authentication
const authPrefixes = ["/tracker"];
const authRoutes = ["/profile"];

// Path prefixes that require admin role
const adminPrefixes = ["/admin"];

// Protected API routes (require authentication)
const protectedApiPrefixes = ["/api/tracker", "/api/users"];

// Admin-only API route + method combinations
const adminApiRules: { prefix: string; methods?: string[] }[] = [
  { prefix: "/api/users" },
  { prefix: "/api/info-pages", methods: ["POST", "PUT", "DELETE"] },
  { prefix: "/api/menu-items", methods: ["PUT"] },
  { prefix: "/api/emotions", methods: ["POST", "PUT", "PATCH"] },
];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

function isAuthRoute(pathname: string): boolean {
  if (authRoutes.includes(pathname)) return true;
  if (authPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

function isAdminRoute(pathname: string): boolean {
  return adminPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedApi(pathname: string): boolean {
  return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isAdminApi(pathname: string, method: string): boolean {
  return adminApiRules.some((rule) => {
    if (!pathname.startsWith(rule.prefix)) return false;
    if (!rule.methods) return true;
    return rule.methods.includes(method);
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get the JWT token from the request
  const token = await getToken({ req: request });

  // Handle protected API routes
  if (pathname.startsWith("/api/")) {
    // Check if this API route requires admin access
    if (isAdminApi(pathname, method)) {
      if (!token) {
        return NextResponse.json(
          { error: "Non authentifié" },
          { status: 401 }
        );
      }
      if (token.role !== "administrateur") {
        return NextResponse.json(
          { error: "Accès interdit" },
          { status: 403 }
        );
      }
      return NextResponse.next();
    }

    // Check if this API route requires authentication
    if (isProtectedApi(pathname)) {
      if (!token) {
        return NextResponse.json(
          { error: "Non authentifié" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Other API routes pass through
    return NextResponse.next();
  }

  // Handle admin page routes
  if (isAdminRoute(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role !== "administrateur") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Handle authenticated page routes
  if (isAuthRoute(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // All other routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
