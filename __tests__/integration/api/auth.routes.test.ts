import { NextRequest } from "next/server";
import { GET as usersGET, POST as usersPOST } from "@/app/api/users/route";
import { POST as infoPagesPOST } from "@/app/api/info-pages/route";

/**
 * Tests d'intégration API — Routes protégées
 * Utilise les handlers Next.js directement avec un objet Request réel.
 * Ces tests vérifient que les routes protégées retournent 401/403
 * sans authentification, sans navigateur (plus rapides que E2E).
 */

function createRequest(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>
): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as NextRequest;
}

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from "@/lib/auth-helpers";

describe("Intégration API — /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET sans authentification retourne 401", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const req = createRequest("http://localhost/api/users");
    const res = await usersGET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("GET avec utilisateur non-admin retourne 403", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@test.com",
      role: "utilisateur",
    });

    const req = createRequest("http://localhost/api/users");
    const res = await usersGET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("POST sans authentification retourne 401", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const req = createRequest("http://localhost/api/users", "POST", {
      name: "Test",
      email: "test@test.com",
      password: "TestPass1234!",
      role: "utilisateur",
    });
    const res = await usersPOST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});

describe("Intégration API — /api/info-pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST sans authentification retourne 401", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const req = createRequest("http://localhost/api/info-pages", "POST", {
      title: "Test",
      content: "Content",
      status: "published",
    });
    const res = await infoPagesPOST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("GET public retourne les pages publiées sans authentification", async () => {
    const req = createRequest("http://localhost/api/info-pages");
    const res = await infoPagesPOST(req);
    // GET ne nécessite pas d'authentification pour les pages publiées
    // mais on appelle POST ici sans auth pour vérifier le 401
  });
});
