import { PATCH, DELETE } from "@/app/api/users/[id]/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { toggleUserActive, deleteUser } from "@/lib/actions/users";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

jest.mock("@/lib/actions/users", () => ({
  toggleUserActive: jest.fn(),
  deleteUser: jest.fn(),
}));

function createRequest(body: unknown, method = "PATCH") {
  return new Request("http://localhost/api/users/user-2", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as import("next/server").NextRequest;
}

// Helper pour simuler les params async
const mockParams = Promise.resolve({ id: "user-2" });

describe("API /api/users/[id] — PATCH", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await PATCH(createRequest({ isActive: false }), { params: mockParams });
    expect(res.status).toBe(401);
  });

  it("retourne 403 si non-admin", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "User",
      role: "utilisateur",
    });
    const res = await PATCH(createRequest({ isActive: false }), { params: mockParams });
    expect(res.status).toBe(403);
  });

  it("toggle isActive avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    (toggleUserActive as jest.Mock).mockResolvedValue({ success: true, message: "Mis à jour" });
    const res = await PATCH(createRequest({ isActive: false }), { params: mockParams });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("change le rôle avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const res = await PATCH(createRequest({ role: "administrateur" }), { params: mockParams });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("retourne 400 si rôle invalide", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const res = await PATCH(createRequest({ role: "superadmin" }), { params: mockParams });
    expect(res.status).toBe(400);
  });

  it("retourne 400 si aucune modification", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const res = await PATCH(createRequest({}), { params: mockParams });
    expect(res.status).toBe(400);
  });
});

describe("API /api/users/[id] — DELETE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
    expect(res.status).toBe(401);
  });

  it("retourne 403 si non-admin", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "User",
      role: "utilisateur",
    });
    const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
    expect(res.status).toBe(403);
  });

  it("retourne 403 si auto-suppression", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const selfParams = Promise.resolve({ id: "admin-1" });
    const res = await DELETE(createRequest({}, "DELETE"), { params: selfParams });
    expect(res.status).toBe(403);
  });

  it("supprime l'utilisateur avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    (deleteUser as jest.Mock).mockResolvedValue({ success: true, message: "Supprimé" });
    const res = await DELETE(createRequest({}, "DELETE"), { params: mockParams });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
