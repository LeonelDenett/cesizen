import { GET, POST } from "@/app/api/users/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { createUserAsAdmin } from "@/lib/actions/users";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          offset: jest.fn().mockResolvedValue([]),
        }),
        where: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

jest.mock("@/lib/actions/users", () => ({
  createUserAsAdmin: jest.fn(),
}));

function createRequest(body: unknown, method = "POST", url = "http://localhost/api/users") {
  const init: RequestInit = { method };
  if (body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

describe("API /api/users — GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await GET(createRequest({}, "GET", "http://localhost/api/users"));
    expect(res.status).toBe(401);
  });

  it("retourne 403 si non-admin", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
    const res = await GET(createRequest({}, "GET", "http://localhost/api/users"));
    expect(res.status).toBe(403);
  });

  it("retourne la liste des utilisateurs avec pagination", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    
    // Mock count query — needs to return an iterable array
    const mockFrom = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        offset: jest.fn().mockResolvedValue([]),
      }),
      where: jest.fn().mockResolvedValue([]),
    });
    
    // First call returns count, second call returns list
    let callCount = 0;
    (db.select as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // count query — returns an array with one element
        return {
          from: jest.fn().mockResolvedValue([{ count: 0 }]),
        };
      }
      return { from: mockFrom };
    });
    
    const res = await GET(createRequest({}, "GET", "http://localhost/api/users?page=1&limit=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("users");
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("totalPages");
  });
});

describe("API /api/users — POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(createRequest({ name: "Test", email: "test@test.com", role: "utilisateur", password: "TestPass1234!" }));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si champs manquants", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    const res = await POST(createRequest({ name: "Test" }));
    expect(res.status).toBe(400);
  });

  it("retourne 400 si rôle invalide", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    const res = await POST(createRequest({ name: "Test", email: "test@test.com", role: "superadmin", password: "TestPass1234!" }));
    expect(res.status).toBe(400);
  });

  it("retourne 409 si createUserAsAdmin échoue", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    (createUserAsAdmin as jest.Mock).mockResolvedValue({ success: false, message: "Email déjà utilisé" });
    const res = await POST(createRequest({ name: "Test", email: "test@test.com", role: "utilisateur", password: "TestPass1234!" }));
    expect(res.status).toBe(409);
  });

  it("crée un utilisateur avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    (createUserAsAdmin as jest.Mock).mockResolvedValue({ success: true, user: { id: "user-1", name: "Test", email: "test@test.com" } });
    const res = await POST(createRequest({ name: "Test", email: "test@test.com", role: "utilisateur", password: "TestPass1234!" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("user-1");
  });
});
