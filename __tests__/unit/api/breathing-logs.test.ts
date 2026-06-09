import { GET, POST } from "@/app/api/breathing-logs/route";
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
        returning: jest.fn().mockResolvedValue([{ id: "log-1" }]),
      }),
    }),
  },
}));

function createRequest(body?: unknown, method = "POST", url = "http://localhost/api/breathing-logs") {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

describe("API /api/breathing-logs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await GET(createRequest(undefined, "GET"));
      expect(res.status).toBe(401);
    });

    it("retourne les logs de l'utilisateur", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await GET(createRequest(undefined, "GET", "http://localhost/api/breathing-logs?days=7"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("logs");
    });
  });

  describe("POST", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await POST(createRequest({ exerciseId: "1", cycles: 5, durationSeconds: 60 }));
      expect(res.status).toBe(401);
    });

    it("retourne 400 si champs manquants", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({ exerciseId: "1" }));
      expect(res.status).toBe(400);
    });

    it("crée un log avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({ exerciseId: "1", cycles: 5, durationSeconds: 60, challengeId: "challenge-1" }));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("log");
    });
  });
});
