import { GET, PUT } from "@/app/api/menu-items/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { updateMenuItems } from "@/lib/actions/info-pages";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

jest.mock("@/lib/actions/info-pages", () => ({
  updateMenuItems: jest.fn(),
}));

function createRequest(body: unknown, method = "PUT") {
  return new Request("http://localhost/api/menu-items", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as import("next/server").NextRequest;
}

describe("API /api/menu-items", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne la liste des items de menu (public)", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("items");
    });
  });

  describe("PUT", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await PUT(createRequest({ items: [{ label: "Test", pageId: "page-1", displayOrder: 1 }] }));
      expect(res.status).toBe(401);
    });

    it("retourne 403 si non-admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
      const res = await PUT(createRequest({ items: [{ label: "Test", pageId: "page-1", displayOrder: 1 }] }));
      expect(res.status).toBe(403);
    });

    it("retourne 400 si items manquant", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      const res = await PUT(createRequest({}));
      expect(res.status).toBe(400);
    });

    it("met à jour le menu avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      (updateMenuItems as jest.Mock).mockResolvedValue({ success: true, items: [{ id: "item-1", label: "Test" }] });
      const res = await PUT(createRequest({ items: [{ label: "Test", pageId: "page-1", displayOrder: 1 }] }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("items");
    });
  });
});
