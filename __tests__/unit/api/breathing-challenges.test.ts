import { GET, POST, DELETE } from "@/app/api/breathing-challenges/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: "challenge-1" }]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

function createRequest(body?: unknown, method = "POST", url = "http://localhost/api/breathing-challenges") {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

describe("API /api/breathing-challenges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("retourne les défis de l'utilisateur", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("challenges");
    });
  });

  describe("POST", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await POST(createRequest({ exerciseId: "1", exerciseName: "Test" }));
      expect(res.status).toBe(401);
    });

    it("retourne 400 si champs manquants", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({}));
      expect(res.status).toBe(400);
    });

    it("crée un défi avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({ exerciseId: "1", exerciseName: "Test", timesPerDay: 3, daysPerWeek: 5, cyclesPerSession: 6 }));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("challenge");
    });
  });

  describe("DELETE", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await DELETE(createRequest(undefined, "DELETE", "http://localhost/api/breathing-challenges?id=1"));
      expect(res.status).toBe(401);
    });

    it("retourne 400 si ID manquant", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await DELETE(createRequest(undefined, "DELETE", "http://localhost/api/breathing-challenges"));
      expect(res.status).toBe(400);
    });

    it("désactive le défi avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await DELETE(createRequest(undefined, "DELETE", "http://localhost/api/breathing-challenges?id=1"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
