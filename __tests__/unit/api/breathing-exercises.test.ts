import { GET, POST } from "@/app/api/breathing-exercises/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: "ex-1", code: "55", name: "5-5" }]),
      }),
    }),
  },
}));

function createRequest(body: unknown) {
  return new Request("http://localhost/api/breathing-exercises", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as import("next/server").NextRequest;
}

describe("API /api/breathing-exercises", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne la liste des exercices actifs (public)", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("exercises");
    });
  });

  describe("POST", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await POST(createRequest({ code: "99", name: "Test", description: "Test", inspire: 4, expire: 6, benefit: "Test" }));
      expect(res.status).toBe(401);
    });

    it("retourne 403 si non-admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
      const res = await POST(createRequest({ code: "99", name: "Test", description: "Test", inspire: 4, expire: 6, benefit: "Test" }));
      expect(res.status).toBe(403);
    });

    it("retourne 400 si champs manquants", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      const res = await POST(createRequest({ code: "99" }));
      expect(res.status).toBe(400);
    });

    it("crée un exercice avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      const res = await POST(createRequest({ code: "99", name: "Test", description: "Test", inspire: 4, hold: 0, expire: 6, benefit: "Test" }));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("exercise");
    });
  });
});
