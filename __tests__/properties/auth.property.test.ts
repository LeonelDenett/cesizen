import * as fc from "fast-check";
import { registerSchema, resetPasswordConfirmSchema } from "@/lib/validators/auth";

/**
 * Feature: cesizen-app
 * Property 3: Validación de contraseña rechaza contraseñas débiles
 * Validates: Requirements 1.3
 *
 * For any string that does not meet at least one of the security criteria
 * (minimum 8 characters, at least one uppercase, one lowercase, and one number),
 * the password validation function must return an invalid result.
 */

// Generator: passwords that are too short (0-7 chars)
const tooShortPassword = fc.string({ minLength: 0, maxLength: 7 });

// Generator: 8+ char passwords missing uppercase (only lowercase + digits, must have both)
const noUppercasePassword = fc
  .stringMatching(/^[a-z0-9]{8,50}$/)
  .filter((s) => /[a-z]/.test(s) && /[0-9]/.test(s));

// Generator: 8+ char passwords missing lowercase (only uppercase + digits, must have both)
const noLowercasePassword = fc
  .stringMatching(/^[A-Z0-9]{8,50}$/)
  .filter((s) => /[A-Z]/.test(s) && /[0-9]/.test(s));

// Generator: 8+ char passwords missing digits (only letters, must have upper + lower)
const noDigitPassword = fc
  .stringMatching(/^[a-zA-Z]{8,50}$/)
  .filter((s) => /[a-z]/.test(s) && /[A-Z]/.test(s));

// Combine all weak password generators
const weakPassword = fc.oneof(
  tooShortPassword,
  noUppercasePassword,
  noLowercasePassword,
  noDigitPassword
);

// Valid base data so we isolate password validation
const validName = fc.string({ minLength: 1, maxLength: 100 });
const validEmail = fc.constant("test@example.com");

describe("Property 3: Validación de contraseña rechaza contraseñas débiles", () => {
  // **Validates: Requirements 1.3**
  it("registerSchema rejects any password that fails at least one security criterion", () => {
    fc.assert(
      fc.property(validName, validEmail, weakPassword, (name, email, password) => {
        const result = registerSchema.safeParse({ name, email, password });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 1.3**
  it("resetPasswordConfirmSchema rejects any weak password", () => {
    fc.assert(
      fc.property(weakPassword, (password) => {
        const result = resetPasswordConfirmSchema.safeParse({
          token: "valid-token-value",
          password,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cesizen-app
 * Property 5: Credenciales válidas producen sesión autenticada
 * Validates: Requirements 2.1
 *
 * For any active user with valid credentials (correct email and password),
 * the login process must create a session with a valid token and a future expiration date.
 */

/**
 * Feature: cesizen-app
 * Property 6: Credenciales inválidas producen error genérico
 * Validates: Requirements 2.2
 *
 * For any combination of email and password where at least one is incorrect,
 * the system must return the same generic error message "Email ou mot de passe incorrect"
 * without distinguishing which field failed.
 */

// We test the authorize function extracted from authOptions in lib/auth.ts.
// We mock the DB layer and bcryptjs to isolate the authentication logic.

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

// Extract the authorize function from the CredentialsProvider
const credentialsProvider = authOptions.providers.find(
  (p) => p.id === "credentials"
) as { options: { authorize: (credentials: { email: string; password: string }) => Promise<unknown> } };
const authorize = credentialsProvider.options.authorize;

// Generators for Properties 5 & 6
const arbEmail = fc.emailAddress();
const arbName = fc.string({ minLength: 1, maxLength: 100 });
const arbPassword = fc.string({ minLength: 8, maxLength: 50 });
const arbUUID = fc.uuid();

// Helper to build a mock user row
function buildMockUser(overrides: Partial<{
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
}> = {}) {
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000001",
    name: overrides.name ?? "Test User",
    email: overrides.email ?? "test@example.com",
    passwordHash: overrides.passwordHash ?? "$2b$10$hashedpassword",
    role: overrides.role ?? "utilisateur",
    isActive: overrides.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Property 5: Credenciales válidas producen sesión autenticada", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 2.1**
  it("for any active user with valid credentials, authorize returns a user object with id, name, email, and role", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        arbEmail,
        arbPassword,
        fc.constantFrom("utilisateur" as const, "administrateur" as const),
        async (id, name, email, password, role) => {
          const mockUser = buildMockUser({ id, name, email, role, isActive: true });

          // Mock DB: user found
          const mockLimit = jest.fn().mockResolvedValue([mockUser]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock bcrypt: password matches
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);

          const result = await authorize({ email, password });

          // Must return a user object (not null)
          expect(result).not.toBeNull();
          expect(result).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 6: Credenciales inválidas producen error genérico", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 2.2**
  it("for any email not found in the database, authorize returns null (generic error)", async () => {
    await fc.assert(
      fc.asyncProperty(arbEmail, arbPassword, async (email, password) => {
        // Mock DB: no user found
        const mockLimit = jest.fn().mockResolvedValue([]);
        const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

        const result = await authorize({ email, password });

        // Must return null — NextAuth translates this to the generic error
        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 2.2**
  it("for any existing user with wrong password, authorize returns null (generic error)", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        arbEmail,
        arbPassword,
        async (id, name, email, password) => {
          const mockUser = buildMockUser({ id, name, email, isActive: true });

          // Mock DB: user found
          const mockLimit = jest.fn().mockResolvedValue([mockUser]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock bcrypt: password does NOT match
          (bcrypt.compare as jest.Mock).mockResolvedValue(false);

          const result = await authorize({ email, password });

          // Must return null — same generic error, no distinction
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 2.2**
  it("both failure modes (wrong email, wrong password) produce the same null result", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        arbEmail,
        arbPassword,
        arbEmail,
        arbPassword,
        async (id, name, existingEmail, existingPassword, wrongEmail, wrongPassword) => {
          // Case 1: email not found
          const mockLimitEmpty = jest.fn().mockResolvedValue([]);
          const mockWhereEmpty = jest.fn().mockReturnValue({ limit: mockLimitEmpty });
          const mockFromEmpty = jest.fn().mockReturnValue({ where: mockWhereEmpty });
          (db.select as jest.Mock).mockReturnValue({ from: mockFromEmpty });

          const resultWrongEmail = await authorize({ email: wrongEmail, password: existingPassword });

          // Case 2: wrong password
          const mockUser = buildMockUser({ id, name, email: existingEmail, isActive: true });
          const mockLimitFound = jest.fn().mockResolvedValue([mockUser]);
          const mockWhereFound = jest.fn().mockReturnValue({ limit: mockLimitFound });
          const mockFromFound = jest.fn().mockReturnValue({ where: mockWhereFound });
          (db.select as jest.Mock).mockReturnValue({ from: mockFromFound });
          (bcrypt.compare as jest.Mock).mockResolvedValue(false);

          const resultWrongPassword = await authorize({ email: existingEmail, password: wrongPassword });

          // Both must produce the exact same result: null
          expect(resultWrongEmail).toBeNull();
          expect(resultWrongPassword).toBeNull();
          expect(resultWrongEmail).toEqual(resultWrongPassword);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cesizen-app
 * Property 1: El registro crea un usuario válido
 * Validates: Requirements 1.1
 *
 * For any valid combination of name, email, and password (meeting security criteria),
 * registering a user must result in an account existing in the database with role
 * "utilisateur", active status, and the provided data.
 */

/**
 * Feature: cesizen-app
 * Property 4: Las contraseñas se almacenan como hash bcrypt
 * Validates: Requirements 1.4, 14.2
 *
 * For any registered user in the system, the password_hash field stored in the
 * database must be a valid bcrypt hash (prefix $2b or $2a) and must never match
 * the plaintext password.
 */

// --- Generators for Properties 1 & 4 ---

// Valid password: 8+ chars, at least one uppercase, one lowercase, one digit
const validPasswordArb = fc
  .tuple(
    fc.stringMatching(/^[A-Z]{1,3}$/),
    fc.stringMatching(/^[a-z]{1,3}$/),
    fc.stringMatching(/^[0-9]{1,3}$/),
    fc.stringMatching(/^[A-Za-z0-9]{1,11}$/)
  )
  .map(([upper, lower, digit, rest]) => upper + lower + digit + rest)
  .filter((s) => s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s));

const validNameArb = fc.stringMatching(/^[A-Za-zÀ-ÿ ]{1,50}$/).filter((s) => s.trim().length > 0);

const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z]{1,10}$/),
    fc.stringMatching(/^[a-z]{2,6}$/)
  )
  .map(([local, domain]) => `${local}@${domain}.com`);

// Track what was inserted into the DB
let lastInsertedValues: Record<string, unknown> | null = null;

// Mock insert chain for registration tests
const mockRegInsertValues = jest.fn((values: Record<string, unknown>) => {
  lastInsertedValues = values;
  return Promise.resolve();
});
const mockRegInsert = jest.fn(() => ({ values: mockRegInsertValues }));

describe("Property 1: El registro crea un usuario válido", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastInsertedValues = null;
  });

  // **Validates: Requirements 1.1**
  it("for any valid registration data, registerUser creates a user with role 'utilisateur' and the provided name/email", async () => {
    const { registerUser } = await import("@/lib/actions/auth");

    await fc.assert(
      fc.asyncProperty(
        validNameArb,
        validEmailArb,
        validPasswordArb,
        async (name, email, password) => {
          jest.clearAllMocks();
          lastInsertedValues = null;

          // Mock DB select: no existing user (email available)
          const mockLimit = jest.fn().mockResolvedValue([]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock DB insert
          (db as unknown as { insert: jest.Mock }).insert = mockRegInsert;
          mockRegInsertValues.mockImplementation((values: Record<string, unknown>) => {
            lastInsertedValues = values;
            return Promise.resolve();
          });

          // Mock bcrypt.hash to return a realistic bcrypt hash
          (bcrypt as unknown as { hash: jest.Mock }).hash.mockResolvedValue(
            "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWX"
          );

          const formData = new FormData();
          formData.set("name", name);
          formData.set("email", email);
          formData.set("password", password);

          const result = await registerUser(undefined, formData);

          // Registration must succeed
          expect(result?.success).toBe(true);

          // DB insert must have been called
          expect(mockRegInsert).toHaveBeenCalled();
          expect(lastInsertedValues).not.toBeNull();

          // Verify inserted data
          expect(lastInsertedValues!.name).toBe(name);
          expect(lastInsertedValues!.email).toBe(email);
          expect(lastInsertedValues!.role).toBe("utilisateur");

          // Password must be hashed, not plaintext
          expect(lastInsertedValues!.passwordHash).not.toBe(password);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 4: Las contraseñas se almacenan como hash bcrypt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastInsertedValues = null;
  });

  // **Validates: Requirements 1.4, 14.2**
  it("for any registered user, the stored password_hash is a valid bcrypt hash and never matches the plaintext password", async () => {
    const { registerUser } = await import("@/lib/actions/auth");

    await fc.assert(
      fc.asyncProperty(
        validNameArb,
        validEmailArb,
        validPasswordArb,
        async (name, email, password) => {
          jest.clearAllMocks();
          lastInsertedValues = null;

          // Mock DB select: no existing user
          const mockLimit = jest.fn().mockResolvedValue([]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock DB insert to capture values
          (db as unknown as { insert: jest.Mock }).insert = mockRegInsert;
          mockRegInsertValues.mockImplementation((values: Record<string, unknown>) => {
            lastInsertedValues = values;
            return Promise.resolve();
          });

          // Mock bcrypt.hash: return a realistic bcrypt hash with proper prefix
          const fakeBcryptHash = `$2b$10$${Buffer.from(email + password).toString("base64").slice(0, 43)}`;
          (bcrypt as unknown as { hash: jest.Mock }).hash.mockResolvedValue(fakeBcryptHash);

          const formData = new FormData();
          formData.set("name", name);
          formData.set("email", email);
          formData.set("password", password);

          const result = await registerUser(undefined, formData);

          expect(result?.success).toBe(true);
          expect(lastInsertedValues).not.toBeNull();

          const storedHash = lastInsertedValues!.passwordHash as string;

          // Must be a valid bcrypt hash (prefix $2b or $2a)
          expect(storedHash).toMatch(/^\$2[ab]\$/);

          // Must NEVER match the plaintext password
          expect(storedHash).not.toBe(password);

          // Verify bcrypt.hash was called with the plaintext password and cost >= 10
          expect((bcrypt as unknown as { hash: jest.Mock }).hash).toHaveBeenCalledWith(
            password,
            expect.any(Number)
          );
          const hashCost = (bcrypt as unknown as { hash: jest.Mock }).hash.mock.calls[0][1];
          expect(hashCost).toBeGreaterThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cesizen-app
 * Property 7: Login de administrador redirige al Back-Office
 * Validates: Requirements 2.3
 *
 * For any user with role "administrateur" who logs in with valid credentials,
 * the authentication response must indicate redirection to the Back-Office (/admin).
 * The authorize function returns a user object with role "administrateur",
 * which the client-side logic (LoginForm) uses to redirect to /admin.
 */
describe("Property 7: Login de administrador redirige al Back-Office", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 2.3**
  it("for any admin user with valid credentials, authorize returns a user with role 'administrateur' enabling /admin redirection", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        arbEmail,
        arbPassword,
        async (id, name, email, password) => {
          const mockUser = buildMockUser({
            id,
            name,
            email,
            role: "administrateur",
            isActive: true,
          });

          // Mock DB: admin user found
          const mockLimit = jest.fn().mockResolvedValue([mockUser]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock bcrypt: password matches
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);

          const result = await authorize({ email, password });

          // Must return a non-null user object
          expect(result).not.toBeNull();

          // The returned user must have role "administrateur"
          const user = result as { id: string; name: string; email: string; role: string };
          expect(user.role).toBe("administrateur");

          // The returned user must have the correct identity fields
          expect(user.id).toBe(id);
          expect(user.email).toBe(email);
          expect(user.name).toBe(name);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 2.3**
  it("admin role in authorize response is distinct from regular user role, enabling differential redirection", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        arbEmail,
        arbPassword,
        async (id, name, email, password) => {
          // Test with admin user
          const adminUser = buildMockUser({
            id,
            name,
            email,
            role: "administrateur",
            isActive: true,
          });

          const mockLimit = jest.fn().mockResolvedValue([adminUser]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);

          const adminResult = await authorize({ email, password }) as { role: string };

          // Now test with regular user (same credentials, different role)
          const regularUser = buildMockUser({
            id,
            name,
            email,
            role: "utilisateur",
            isActive: true,
          });

          const mockLimit2 = jest.fn().mockResolvedValue([regularUser]);
          const mockWhere2 = jest.fn().mockReturnValue({ limit: mockLimit2 });
          const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom2 });
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);

          const regularResult = await authorize({ email, password }) as { role: string };

          // Admin gets "administrateur" → client redirects to /admin
          expect(adminResult.role).toBe("administrateur");
          // Regular user gets "utilisateur" → client redirects to /
          expect(regularResult.role).toBe("utilisateur");
          // The roles must be different, enabling differential redirection
          expect(adminResult.role).not.toBe(regularResult.role);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cesizen-app
 * Property 10: La respuesta de reinicio de contraseña es uniforme
 * Validates: Requirements 4.1
 *
 * For any email provided in a password reset request (whether the account exists or not),
 * the HTTP response must be identical in structure and status code, without revealing
 * if the account exists.
 */

/**
 * Feature: cesizen-app
 * Property 11: Round-trip de token de reinicio de contraseña
 * Validates: Requirements 4.2
 *
 * For any user with an active account, requesting a password reset and then using the
 * generated token with a valid password must result in: (a) the new password works for
 * login, (b) the token is marked as used.
 */

/**
 * Feature: cesizen-app
 * Property 12: Solo el último token de reinicio es válido
 * Validates: Requirements 4.4
 *
 * For any user who requests multiple password resets, only the most recent token must
 * be valid; all previous tokens must be invalidated.
 */

// We reuse the existing db and bcrypt mocks from above.
// We need to import the password reset functions.
import { requestPasswordReset, confirmPasswordReset } from "@/lib/actions/auth";

// Track DB operations for password reset tests
let capturedInsertValues: Record<string, unknown> | null = null;
let capturedUpdateCalls: Array<{ table: string; set: Record<string, unknown>; where: unknown }> = [];

// Helper to create FormData from an object
function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

describe("Property 10: La respuesta de reinicio de contraseña es uniforme", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedInsertValues = null;
    capturedUpdateCalls = [];
  });

  // **Validates: Requirements 4.1**
  it("for any valid email (existing or not), requestPasswordReset returns the same success structure and message", async () => {
    await fc.assert(
      fc.asyncProperty(
        validEmailArb,
        fc.boolean(), // whether the user exists
        async (email, userExists) => {
          jest.clearAllMocks();

          if (userExists) {
            // Mock DB: user found
            const mockUser = buildMockUser({ email, isActive: true });
            const mockLimit = jest.fn().mockResolvedValue([mockUser]);
            const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

            // Mock update (invalidate previous tokens)
            const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
            const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
            (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSet });

            // Mock insert (new token)
            const mockInsertValues = jest.fn().mockResolvedValue(undefined);
            (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({ values: mockInsertValues });
          } else {
            // Mock DB: no user found
            const mockLimit = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
          }

          const formData = makeFormData({ email });
          const result = await requestPasswordReset(undefined, formData);

          // Both cases must return the exact same structure
          expect(result).toEqual({
            success: true,
            message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 4.1**
  it("responses for existing and non-existing emails are structurally identical", async () => {
    await fc.assert(
      fc.asyncProperty(validEmailArb, validEmailArb, async (existingEmail, nonExistingEmail) => {
        jest.clearAllMocks();

        // Case 1: existing user
        const mockUser = buildMockUser({ email: existingEmail, isActive: true });
        const mockLimit1 = jest.fn().mockResolvedValue([mockUser]);
        const mockWhere1 = jest.fn().mockReturnValue({ limit: mockLimit1 });
        const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom1 });

        const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
        const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
        (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSet });

        const mockInsertValues = jest.fn().mockResolvedValue(undefined);
        (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({ values: mockInsertValues });

        const resultExisting = await requestPasswordReset(undefined, makeFormData({ email: existingEmail }));

        jest.clearAllMocks();

        // Case 2: non-existing user
        const mockLimit2 = jest.fn().mockResolvedValue([]);
        const mockWhere2 = jest.fn().mockReturnValue({ limit: mockLimit2 });
        const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom2 });

        const resultNonExisting = await requestPasswordReset(undefined, makeFormData({ email: nonExistingEmail }));

        // Both responses must be structurally identical
        expect(Object.keys(resultExisting!).sort()).toEqual(Object.keys(resultNonExisting!).sort());
        expect(resultExisting!.success).toBe(resultNonExisting!.success);
        expect(resultExisting!.message).toBe(resultNonExisting!.message);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 11: Round-trip de token de reinicio de contraseña", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 4.2**
  it("for any active user, requesting a reset and confirming with the token updates the password and marks the token as used", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        validEmailArb,
        validPasswordArb, // new password (must be strong)
        async (userId, name, email, newPassword) => {
          jest.clearAllMocks();

          const mockUser = buildMockUser({ id: userId, name, email, isActive: true });

          // --- Step 1: requestPasswordReset ---
          // Mock select: user found
          const mockLimit1 = jest.fn().mockResolvedValue([mockUser]);
          const mockWhere1 = jest.fn().mockReturnValue({ limit: mockLimit1 });
          const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom1 });

          // Mock update (invalidate previous tokens)
          const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
          const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
          (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSet });

          // Mock insert (capture the generated token)
          let generatedToken: string | null = null;
          const mockInsertValues = jest.fn().mockImplementation((values: Record<string, unknown>) => {
            generatedToken = values.token as string;
            return Promise.resolve();
          });
          (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({ values: mockInsertValues });

          const resetResult = await requestPasswordReset(undefined, makeFormData({ email }));
          expect(resetResult!.success).toBe(true);
          expect(generatedToken).not.toBeNull();

          // --- Step 2: confirmPasswordReset with the generated token ---
          jest.clearAllMocks();

          const tokenRecord = {
            id: "token-id-1",
            userId,
            token: generatedToken!,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // valid (1h from now)
            used: false,
            createdAt: new Date(),
          };

          // Mock select: token found, valid, not used
          const mockLimitToken = jest.fn().mockResolvedValue([tokenRecord]);
          const mockWhereToken = jest.fn().mockReturnValue({ limit: mockLimitToken });
          const mockFromToken = jest.fn().mockReturnValue({ where: mockWhereToken });
          (db.select as jest.Mock).mockReturnValue({ from: mockFromToken });

          // Mock bcrypt.hash for new password
          const newHash = `$2b$10$newhashedpassword${newPassword.slice(0, 10)}`;
          (bcrypt as unknown as { hash: jest.Mock }).hash.mockResolvedValue(newHash);

          // Track update calls (password update + token mark as used)
          const updateCalls: Array<Record<string, unknown>> = [];
          const mockUpdateWhere2 = jest.fn().mockResolvedValue(undefined);
          const mockUpdateSet2 = jest.fn().mockImplementation((setValues: Record<string, unknown>) => {
            updateCalls.push(setValues);
            return { where: mockUpdateWhere2 };
          });
          (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSet2 });

          const confirmResult = await confirmPasswordReset(
            undefined,
            makeFormData({ token: generatedToken!, password: newPassword })
          );

          // (a) Confirm must succeed
          expect(confirmResult!.success).toBe(true);

          // (b) bcrypt.hash was called with the new password
          expect((bcrypt as unknown as { hash: jest.Mock }).hash).toHaveBeenCalledWith(newPassword, 10);

          // (c) Token must be marked as used (one of the update calls sets used: true)
          const tokenUsedUpdate = updateCalls.find((call) => call.used === true);
          expect(tokenUsedUpdate).toBeDefined();

          // (d) Password must be updated (one of the update calls sets passwordHash)
          const passwordUpdate = updateCalls.find((call) => call.passwordHash !== undefined);
          expect(passwordUpdate).toBeDefined();
          expect(passwordUpdate!.passwordHash).toBe(newHash);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 12: Solo el último token de reinicio es válido", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 4.4**
  it("for any user requesting multiple resets, previous tokens are invalidated and only the latest token works", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbName,
        validEmailArb,
        fc.integer({ min: 2, max: 5 }), // number of reset requests
        async (userId, name, email, numRequests) => {
          const mockUser = buildMockUser({ id: userId, name, email, isActive: true });
          const generatedTokens: string[] = [];

          // Perform multiple reset requests, capturing each generated token
          for (let i = 0; i < numRequests; i++) {
            jest.clearAllMocks();

            // Mock select: user found
            const mockLimit = jest.fn().mockResolvedValue([mockUser]);
            const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

            // Mock update (invalidate previous tokens) — track that it's called
            const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
            const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
            (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSet });

            // Mock insert (capture token)
            const mockInsertValues = jest.fn().mockImplementation((values: Record<string, unknown>) => {
              generatedTokens.push(values.token as string);
              return Promise.resolve();
            });
            (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({ values: mockInsertValues });

            const result = await requestPasswordReset(undefined, makeFormData({ email }));
            expect(result!.success).toBe(true);

            // Verify that on each request (after the first), previous tokens are invalidated
            // The update call sets used: true for all tokens of this user
            if (i > 0) {
              expect((db as unknown as { update: jest.Mock }).update).toHaveBeenCalled();
              expect(mockUpdateSet).toHaveBeenCalledWith({ used: true });
            }
          }

          // We should have captured numRequests tokens
          expect(generatedTokens.length).toBe(numRequests);

          // All tokens should be unique (crypto.randomUUID)
          const uniqueTokens = new Set(generatedTokens);
          expect(uniqueTokens.size).toBe(numRequests);

          // --- Verify: old tokens are rejected, only the latest works ---
          const latestToken = generatedTokens[generatedTokens.length - 1];

          // Try confirming with an old token (marked as used)
          if (generatedTokens.length > 1) {
            jest.clearAllMocks();
            const oldToken = generatedTokens[0];

            // Mock select: old token found but marked as used
            const oldTokenRecord = {
              id: "old-token-id",
              userId,
              token: oldToken,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000),
              used: true, // invalidated
              createdAt: new Date(),
            };
            const mockLimitOld = jest.fn().mockResolvedValue([oldTokenRecord]);
            const mockWhereOld = jest.fn().mockReturnValue({ limit: mockLimitOld });
            const mockFromOld = jest.fn().mockReturnValue({ where: mockWhereOld });
            (db.select as jest.Mock).mockReturnValue({ from: mockFromOld });

            const oldResult = await confirmPasswordReset(
              undefined,
              makeFormData({ token: oldToken, password: "NewPass1234" })
            );

            // Old token must be rejected
            expect(oldResult!.success).toBe(false);
          }

          // Try confirming with the latest token (valid)
          jest.clearAllMocks();
          const latestTokenRecord = {
            id: "latest-token-id",
            userId,
            token: latestToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            used: false, // still valid
            createdAt: new Date(),
          };
          const mockLimitLatest = jest.fn().mockResolvedValue([latestTokenRecord]);
          const mockWhereLatest = jest.fn().mockReturnValue({ limit: mockLimitLatest });
          const mockFromLatest = jest.fn().mockReturnValue({ where: mockWhereLatest });
          (db.select as jest.Mock).mockReturnValue({ from: mockFromLatest });

          (bcrypt as unknown as { hash: jest.Mock }).hash.mockResolvedValue("$2b$10$newhashedvalue");

          const mockUpdateWhereFinal = jest.fn().mockResolvedValue(undefined);
          const mockUpdateSetFinal = jest.fn().mockReturnValue({ where: mockUpdateWhereFinal });
          (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({ set: mockUpdateSetFinal });

          const latestResult = await confirmPasswordReset(
            undefined,
            makeFormData({ token: latestToken, password: "NewPass1234" })
          );

          // Latest token must succeed
          expect(latestResult!.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
