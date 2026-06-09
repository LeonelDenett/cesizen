import { GET } from "@/app/api/health/route";

describe("API /api/health", () => {
  it("retourne 200 avec status ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("service", "cesizen");
    expect(body).toHaveProperty("timestamp");
  });
});
