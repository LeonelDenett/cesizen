import { GET, PUT, DELETE } from "@/app/api/info-pages/[slug]/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { updateInfoPage, deleteInfoPage } from "@/lib/actions/info-pages";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ id: "page-1" }]),
        }),
      }),
    }),
  },
}));

jest.mock("@/lib/actions/info-pages", () => ({
  updateInfoPage: jest.fn(),
  deleteInfoPage: jest.fn(),
}));

function createRequest(body: unknown, method = "PUT") {
  const init: RequestInit = { method };
  if (body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request("http://localhost/api/info-pages/test-slug", init) as unknown as import("next/server").NextRequest;
}

const mockParams = Promise.resolve({ slug: "test-slug" });

describe("API /api/info-pages/[slug]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retourne une page publiée par slug", async () => {
      const res = await GET(createRequest({}, "GET"), { params: mockParams });
      expect(res.status).toBe(200);
    });
  });

  describe("PUT", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await PUT(createRequest({ title: "Updated" }), { params: mockParams });
      expect(res.status).toBe(401);
    });

    it("retourne 403 si non-admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
      const res = await PUT(createRequest({ title: "Updated" }), { params: mockParams });
      expect(res.status).toBe(403);
    });

    it("retourne 404 si page non trouvée", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      const res = await PUT(createRequest({ title: "Updated" }), { params: mockParams });
      expect(res.status).toBe(404);
    });

    it("met à jour la page avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      // Restore the mock to return the page
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: "page-1" }]),
          }),
        }),
      });
      (updateInfoPage as jest.Mock).mockResolvedValue({ success: true, page: { id: "page-1", title: "Updated" } });
      const res = await PUT(createRequest({ title: "Updated" }), { params: mockParams });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe("Updated");
    });
  });

  describe("DELETE", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
      expect(res.status).toBe(401);
    });

    it("retourne 403 si non-admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
      const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
      expect(res.status).toBe(403);
    });

    it("supprime la page avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      // Restore the mock to return the page
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: "page-1" }]),
          }),
        }),
      });
      (deleteInfoPage as jest.Mock).mockResolvedValue({ success: true, message: "Supprimée" });
      const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
