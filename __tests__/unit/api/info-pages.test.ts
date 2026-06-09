import { GET, POST } from "@/app/api/info-pages/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { createInfoPage } from "@/lib/actions/info-pages";

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
  },
}));

jest.mock("@/lib/actions/info-pages", () => ({
  createInfoPage: jest.fn(),
}));

function createRequest(body: unknown, method = "POST", url = "http://localhost/api/info-pages") {
  const init: RequestInit = { method };
  if (body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

describe("API /api/info-pages — GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne les pages publiées (public)", async () => {
    const res = await GET(createRequest({}, "GET", "http://localhost/api/info-pages"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("pages");
  });

  it("retourne toutes les pages pour admin (with ?all=true)", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      role: "administrateur",
    });
    const res = await GET(createRequest({}, "GET", "http://localhost/api/info-pages?all=true"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("pages");
  });

  it("retourne les pages publiées si non-admin demande ?all=true", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "User",
      role: "utilisateur",
    });
    const res = await GET(createRequest({}, "GET", "http://localhost/api/info-pages?all=true"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("pages");
  });
});

describe("API /api/info-pages — POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(createRequest({ title: "Test", content: "Content" }));
    expect(res.status).toBe(401);
  });

  it("retourne 403 si non-admin", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1", name: "Test", role: "utilisateur" });
    const res = await POST(createRequest({ title: "Test", content: "Content" }));
    expect(res.status).toBe(403);
  });

  it("retourne 400 si createInfoPage échoue", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    (createInfoPage as jest.Mock).mockResolvedValue({ success: false, message: "Erreur" });
    const res = await POST(createRequest({ title: "Test", content: "Content" }));
    expect(res.status).toBe(400);
  });

  it("crée une page avec succès", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "admin-1", name: "Admin", role: "administrateur" });
    (createInfoPage as jest.Mock).mockResolvedValue({ success: true, page: { id: "page-1", title: "Test" } });
    const res = await POST(createRequest({ title: "Test", content: "Content" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("page-1");
  });
});
