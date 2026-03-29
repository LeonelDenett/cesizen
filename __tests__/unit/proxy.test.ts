import { NextRequest } from "next/server";

// Mock getToken from next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

import { getToken } from "next-auth/jwt";
import { proxy } from "@/proxy";

const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;

function createRequest(path: string, method = "GET"): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"), { method });
}

describe("proxy — route protection", () => {
  beforeEach(() => {
    mockedGetToken.mockReset();
  });

  // --- Public routes ---
  describe("public routes", () => {
    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/reset-password",
      "/reset-password/confirm",
      "/info/gestion-du-stress",
      "/api/auth/signin",
      "/api/auth/callback/credentials",
    ];

    it.each(publicPaths)("allows unauthenticated access to %s", async (path) => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest(path));
      // NextResponse.next() does not redirect
      expect(response.headers.get("location")).toBeNull();
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  // --- Authenticated page routes ---
  describe("authenticated page routes", () => {
    it("redirects unauthenticated user from /profile to /login", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/profile"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    });

    it("redirects unauthenticated user from /tracker to /login", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/tracker"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    });

    it("allows authenticated user to access /profile", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/profile"));
      expect(response.headers.get("location")).toBeNull();
    });

    it("allows authenticated user to access /tracker/new", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/tracker/new"));
      expect(response.headers.get("location")).toBeNull();
    });
  });

  // --- Admin page routes ---
  describe("admin page routes", () => {
    it("redirects unauthenticated user from /admin to /login", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/admin/users"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    });

    it("redirects non-admin user from /admin to /", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/admin/users"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    });

    it("allows admin user to access /admin/users", async () => {
      mockedGetToken.mockResolvedValue({ id: "a1", role: "administrateur" } as any);
      const response = await proxy(createRequest("/admin/users"));
      expect(response.headers.get("location")).toBeNull();
    });
  });

  // --- Protected API routes ---
  describe("protected API routes", () => {
    it("returns 401 for unauthenticated /api/tracker request", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/api/tracker"));
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    it("returns 401 for unauthenticated /api/users request", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/api/users"));
      expect(response.status).toBe(401);
    });

    it("allows authenticated user to access /api/tracker", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/tracker"));
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  // --- Admin API routes ---
  describe("admin API routes", () => {
    it("returns 401 for unauthenticated POST /api/info-pages", async () => {
      mockedGetToken.mockResolvedValue(null);
      const response = await proxy(createRequest("/api/info-pages", "POST"));
      expect(response.status).toBe(401);
    });

    it("returns 403 for non-admin POST /api/info-pages", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/info-pages", "POST"));
      expect(response.status).toBe(403);
    });

    it("allows admin POST /api/info-pages", async () => {
      mockedGetToken.mockResolvedValue({ id: "a1", role: "administrateur" } as any);
      const response = await proxy(createRequest("/api/info-pages", "POST"));
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it("allows non-admin GET /api/info-pages (read is not admin-only)", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/info-pages", "GET"));
      // GET on /api/info-pages is not in protectedApiPrefixes, so it passes through
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it("returns 403 for non-admin PUT /api/menu-items", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/menu-items", "PUT"));
      expect(response.status).toBe(403);
    });

    it("returns 403 for non-admin POST /api/emotions", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/emotions", "POST"));
      expect(response.status).toBe(403);
    });

    it("returns 403 for non-admin PATCH /api/emotions", async () => {
      mockedGetToken.mockResolvedValue({ id: "u1", role: "utilisateur" } as any);
      const response = await proxy(createRequest("/api/emotions", "PATCH"));
      expect(response.status).toBe(403);
    });
  });
});
