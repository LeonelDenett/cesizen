import { getCurrentUser } from "@/lib/auth-helpers";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("getCurrentUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne null si aucune session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("retourne null si session sans utilisateur", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: null });
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("retourne l'utilisateur de la session", async () => {
    const mockUser = { id: "user-1", name: "Test", email: "test@test.com", role: "utilisateur" };
    (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
    const user = await getCurrentUser();
    expect(user).toEqual(mockUser);
  });
});
