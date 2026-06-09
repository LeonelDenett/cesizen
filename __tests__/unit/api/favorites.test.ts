import { GET, POST } from "@/app/api/favorites/route";
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
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

function createRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/favorites", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as import("next/server").NextRequest;
}

describe("API /api/favorites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("retourne les favoris de l'utilisateur", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("favorites");
    });
  });

  describe("POST", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await POST(createRequest({ pageId: "page-1" }));
      expect(res.status).toBe(401);
    });

    it("retourne 400 si pageId manquant", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({}));
      expect(res.status).toBe(400);
    });

    it("ajoute un favori avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test" });
      const res = await POST(createRequest({ pageId: "page-1" }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("favorited");
    });
  });
});
