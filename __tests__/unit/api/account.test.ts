import { DELETE } from "@/app/api/account/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
  },
}));

describe("API /api/account — DELETE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Non autorisé");
  });

  it("retourne 403 si l'utilisateur est admin", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const res = await DELETE();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("administrateurs");
  });

  it("supprime le compte utilisateur avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "User",
      role: "utilisateur",
    });
    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
