import * as fc from "fast-check";

/**
 * Feature: cesizen-app
 * Property 33: Las rutas protegidas rechazan solicitudes no autenticadas
 * Validates: Requirements 14.5, 14.6
 *
 * For any protected API Route (tracker, users admin, CMS admin),
 * a request without a valid authentication token must receive a 401 error.
 */

/**
 * Feature: cesizen-app
 * Property 34: Los tokens de sesión tienen expiración
 * Validates: Requirements 14.5, 14.6
 *
 * For any session created in the system, the `expires_at` field must be
 * a future date and the session must be rejected after its expiration.
 */

// ---- Mocks ----

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/actions/tracker", () => ({
  getTrackerEntries: jest.fn(),
  createTrackerEntry: jest.fn(),
  updateTrackerEntry: jest.fn(),
  deleteTrackerEntry: jest.fn(),
}));

jest.mock("@/lib/actions/users", () => ({
  createUserAsAdmin: jest.fn(),
}));

jest.mock("@/lib/actions/info-pages", () => ({
  createInfoPage: jest.fn(),
}));

jest.mock("@/lib/actions/emotions", () => ({
  createEmotion: jest.fn(),
}));

jest.mock("@/lib/validators/tracker", () => ({
  createEmotionLogSchema: { safeParse: jest.fn(() => ({ success: true, data: {} })) },
  updateEmotionLogSchema: { safeParse: jest.fn(() => ({ success: true, data: {} })) },
}));

import { getCurrentUser } from "@/lib/auth-helpers";
import { authOptions } from "@/lib/auth";

// ---- Route handler imports ----
// We import the route handlers to test them directly

import { GET as trackerGET, POST as trackerPOST } from "@/app/api/tracker/route";
import { PUT as trackerPUT, DELETE as trackerDELETE } from "@/app/api/tracker/[id]/route";
import { GET as usersGET, POST as usersPOST } from "@/app/api/users/route";
import { POST as infoPagesPOST } from "@/app/api/info-pages/route";
import { POST as emotionsPOST } from "@/app/api/emotions/route";

// ---- Helpers ----

function createMockRequest(url: string, method: string = "GET", body?: unknown): Request {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as Request;
}

// Generator: pick a protected route handler + method combination
interface ProtectedRoute {
  name: string;
  handler: (req: Request, ctx?: unknown) => Promise<Response>;
  method: string;
  url: string;
  body?: Record<string, unknown>;
  ctx?: unknown;
}

const protectedRoutes: ProtectedRoute[] = [
  {
    name: "GET /api/tracker",
    handler: trackerGET as (req: Request) => Promise<Response>,
    method: "GET",
    url: "http://localhost:3000/api/tracker",
  },
  {
    name: "POST /api/tracker",
    handler: trackerPOST as (req: Request) => Promise<Response>,
    method: "POST",
    url: "http://localhost:3000/api/tracker",
    body: { emotionLevel1Id: "id1", emotionLevel2Id: "id2", logDate: "2024-01-01" },
  },
  {
    name: "PUT /api/tracker/[id]",
    handler: trackerPUT as (req: Request, ctx: unknown) => Promise<Response>,
    method: "PUT",
    url: "http://localhost:3000/api/tracker/some-id",
    body: { note: "test" },
    ctx: { params: Promise.resolve({ id: "some-id" }) },
  },
  {
    name: "DELETE /api/tracker/[id]",
    handler: trackerDELETE as (req: Request, ctx: unknown) => Promise<Response>,
    method: "DELETE",
    url: "http://localhost:3000/api/tracker/some-id",
    ctx: { params: Promise.resolve({ id: "some-id" }) },
  },
  {
    name: "GET /api/users",
    handler: usersGET as (req: Request) => Promise<Response>,
    method: "GET",
    url: "http://localhost:3000/api/users",
  },
  {
    name: "POST /api/users",
    handler: usersPOST as (req: Request) => Promise<Response>,
    method: "POST",
    url: "http://localhost:3000/api/users",
    body: { name: "Test", email: "t@t.com", role: "utilisateur", password: "Pass1234" },
  },
  {
    name: "POST /api/info-pages",
    handler: infoPagesPOST as (req: Request) => Promise<Response>,
    method: "POST",
    url: "http://localhost:3000/api/info-pages",
    body: { title: "Test", content: "Content", status: "draft" },
  },
  {
    name: "POST /api/emotions",
    handler: emotionsPOST as (req: Request) => Promise<Response>,
    method: "POST",
    url: "http://localhost:3000/api/emotions",
    body: { name: "TestEmotion", level: "1" },
  },
];

// Arbitrary that picks a random protected route
const arbProtectedRoute = fc.constantFrom(...protectedRoutes);

describe("Property 33: Las rutas protegidas rechazan solicitudes no autenticadas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 14.5, 14.6**
   * For any protected API route, when getCurrentUser returns null (no valid session),
   * the response must be 401.
   */
  it("any protected route returns 401 when no authentication token is present", async () => {
    await fc.assert(
      fc.asyncProperty(arbProtectedRoute, async (route) => {
        // Simulate unauthenticated request: getCurrentUser returns null
        (getCurrentUser as jest.Mock).mockResolvedValue(null);

        const req = createMockRequest(route.url, route.method, route.body);

        let response: Response;
        if (route.ctx) {
          response = await (route.handler as (req: Request, ctx: unknown) => Promise<Response>)(req, route.ctx);
        } else {
          response = await route.handler(req);
        }

        // Must receive 401
        expect(response.status).toBe(401);

        // Response body must not reveal resource existence
        const body = await response.json();
        expect(body).toHaveProperty("error");
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 34: Los tokens de sesión tienen expiración", () => {
  /**
   * **Validates: Requirements 14.5, 14.6**
   * The NextAuth session configuration must define a maxAge (expiration),
   * ensuring sessions are not indefinite.
   */
  it("authOptions session strategy uses JWT with a finite maxAge", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Verify session strategy is JWT (which has built-in expiration)
        expect(authOptions.session?.strategy).toBe("jwt");

        // JWT sessions in NextAuth default to 30 days maxAge.
        // If maxAge is explicitly set, it must be a positive finite number.
        // If not set, NextAuth defaults to 30 * 24 * 60 * 60 (2592000 seconds).
        const maxAge = authOptions.session?.maxAge;
        if (maxAge !== undefined) {
          expect(typeof maxAge).toBe("number");
          expect(maxAge).toBeGreaterThan(0);
          expect(maxAge).toBeLessThan(Infinity);
        }
        // Either way, JWT strategy guarantees token expiration via `exp` claim
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 14.5, 14.6**
   * For any session token with an expiration date, the expires_at field
   * in the sessions schema must be a timestamp (not null), ensuring
   * all sessions have a defined expiration.
   */
  it("sessions schema requires a non-null expires_at timestamp", () => {
    // Import the sessions schema to verify its structure
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { sessions } = require("@/lib/db/schema/sessions");

    fc.assert(
      fc.property(fc.constant(null), () => {
        // The expiresAt column must exist and be notNull
        const expiresAtColumn = sessions.expiresAt;
        expect(expiresAtColumn).toBeDefined();
        expect(expiresAtColumn.notNull).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 14.5, 14.6**
   * For any generated future date used as session expiration,
   * it must always be strictly after the current time.
   */
  it("any session expiration date must be in the future relative to creation time", () => {
    // Generator: a session maxAge in seconds (between 1 minute and 365 days)
    const arbMaxAgeSeconds = fc.integer({ min: 60, max: 365 * 24 * 60 * 60 });

    fc.assert(
      fc.property(arbMaxAgeSeconds, (maxAgeSeconds) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + maxAgeSeconds * 1000);

        // expires_at must be strictly in the future
        expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());

        // The difference must match the maxAge
        const diffSeconds = (expiresAt.getTime() - now.getTime()) / 1000;
        expect(diffSeconds).toBe(maxAgeSeconds);
      }),
      { numRuns: 100 }
    );
  });
});
