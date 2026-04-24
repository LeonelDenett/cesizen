import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Route definitions ──

// Public routes (no auth needed)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/reset-password/confirm",
  "/a-propos",
  "/sante",
  "/articles",
  "/respiration",
  "/confidentialite",
  "/mentions-legales",
];

// Public prefixes
const publicPrefixes = ["/info/", "/api/auth/", "/api/info-pages", "/api/favorites"];

// Admin-only page routes
const adminPrefixes = ["/admin"];

// Auth-required page routes (logged in users only, NOT admin)
const authRoutes = ["/profile"];

// Protected API routes (require auth)
const protectedApiPrefixes = ["/api/users", "/api/favorites"];

// Admin-only API rules
const adminApiRules: { prefix: string; methods?: string[] }[] = [
  { prefix: "/api/users" },
  { prefix: "/api/info-pages", methods: ["POST", "PUT", "DELETE"] },
  { prefix: "/api/menu-items", methods: ["PUT"] },
];

// ── Rate limiting (simple in-memory) ──
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return false;
  if (now - record.lastAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return record.count >= MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.lastAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    record.count++;
    record.lastAttempt = now;
  }
}

// ── Helpers ──

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  return publicPrefixes.some((p) => pathname.startsWith(p));
}

function isAdminRoute(pathname: string): boolean {
  return adminPrefixes.some((p) => pathname.startsWith(p));
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.includes(pathname);
}

function isProtectedApi(pathname: string): boolean {
  return protectedApiPrefixes.some((p) => pathname.startsWith(p));
}

function isAdminApi(pathname: string, method: string): boolean {
  return adminApiRules.some((rule) => {
    if (!pathname.startsWith(rule.prefix)) return false;
    if (!rule.methods) return true;
    return rule.methods.includes(method);
  });
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

// ── Security headers ──
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  return response;
}

// ── Main proxy ──

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Rate limit login attempts
  if (pathname === "/api/auth/callback/credentials" && method === "POST") {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: "Trop de tentatives. Réessayez dans 15 minutes." },
          { status: 429 }
        )
      );
    }
    recordLoginAttempt(ip);
  }

  // Public routes — allow (but redirect admin to dashboard)
  if (isPublicRoute(pathname)) {
    if (!pathname.startsWith("/api/")) {
      const pubToken = await getToken({ req: request });
      if (pubToken && pubToken.role === "administrateur") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Get JWT token
  const token = await getToken({ req: request });

  // ── API routes ──
  if (pathname.startsWith("/api/")) {
    // Admin API
    if (isAdminApi(pathname, method)) {
      if (!token) return addSecurityHeaders(NextResponse.json({ error: "Non autorisé" }, { status: 401 }));
      if (token.role !== "administrateur") return addSecurityHeaders(NextResponse.json({ error: "Accès interdit" }, { status: 403 }));
      return addSecurityHeaders(NextResponse.next());
    }
    // Protected API
    if (isProtectedApi(pathname)) {
      if (!token) return addSecurityHeaders(NextResponse.json({ error: "Non autorisé" }, { status: 401 }));
      return addSecurityHeaders(NextResponse.next());
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ── Admin pages — only admin role ──
  if (isAdminRoute(pathname)) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "administrateur") return NextResponse.redirect(new URL("/", request.url));
    // Admin cannot access public pages — they stay in /admin
    return addSecurityHeaders(NextResponse.next());
  }

  // ── Auth-required pages ──
  if (isAuthRoute(pathname)) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    // Admin users redirect to admin dashboard
    if (token.role === "administrateur") return NextResponse.redirect(new URL("/admin", request.url));
    return addSecurityHeaders(NextResponse.next());
  }

  // ── All other routes ──
  // If admin user tries to access public/auth pages, redirect to admin dashboard
  if (token && token.role === "administrateur" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
