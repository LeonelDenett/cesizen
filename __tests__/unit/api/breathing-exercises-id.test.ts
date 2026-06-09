import { PUT, DELETE } from "@/app/api/breathing-exercises/[id]/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: "ex-1", name: "Updated" }]),
        }),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

function createRequest(body: unknown, method = "PUT") {
  return new Request("http://localhost/api/breathing-exercises/ex-1", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as import("next/server").NextRequest;
}

const mockParams = Promise.resolve({ id: "ex-1" });

describe("API /api/breathing-exercises/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT", () => {
    it("retourne 401 si non authentifié", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const res = await PUT(createRequest({ name: "Updated" }), { params: mockParams });
      expect(res.status).toBe(401);
    });

    it("retourne 403 si non-admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
      const res = await PUT(createRequest({ name: "Updated" }), { params: mockParams });
      expect(res.status).toBe(403);
    });

    it("met à jour l'exercice avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      const res = await PUT(createRequest({ name: "Updated" }), { params: mockParams });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("exercise");
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

    it("supprime l'exercice avec succès", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
      const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
