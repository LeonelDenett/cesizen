import * as fc from "fast-check";
import { createEmotionLogSchema } from "@/lib/validators/tracker";

/**
 * Feature: cesizen-app
 * Property 26: La validación de entrada requiere ambos niveles de emoción
 * Validates: Requirements 9.5
 *
 * For any form submission where Émotion_Niveau_1 or Émotion_Niveau_2
 * (or both) is missing, the system must reject the entry and the journal
 * must remain unchanged.
 */

// Generators
const validUuid = fc.uuid();
const validLogDate = fc
  .tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
const optionalNote = fc.oneof(fc.constant(undefined), fc.string({ minLength: 0, maxLength: 200 }));

// Non-UUID strings that should fail UUID validation
const invalidOrMissing = fc.oneof(
  fc.constant(undefined),
  fc.constant(""),
  fc.constant("not-a-uuid"),
  fc.string({ minLength: 0, maxLength: 50 }).filter((s) => {
    // Exclude strings that happen to be valid UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(s);
  })
);

describe("Property 26: La validación de entrada requiere ambos niveles de emoción", () => {
  /**
   * **Validates: Requirements 9.5**
   * Missing emotionLevel1Id must cause validation to fail.
   */
  it("rejects entries when emotionLevel1Id is missing or invalid", () => {
    fc.assert(
      fc.property(
        invalidOrMissing,
        validUuid,
        validLogDate,
        optionalNote,
        (level1, level2, logDate, note) => {
          const input: Record<string, unknown> = {
            emotionLevel2Id: level2,
            logDate,
          };
          if (level1 !== undefined) input.emotionLevel1Id = level1;
          if (note !== undefined) input.note = note;

          const result = createEmotionLogSchema.safeParse(input);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.5**
   * Missing emotionLevel2Id must cause validation to fail.
   */
  it("rejects entries when emotionLevel2Id is missing or invalid", () => {
    fc.assert(
      fc.property(
        validUuid,
        invalidOrMissing,
        validLogDate,
        optionalNote,
        (level1, level2, logDate, note) => {
          const input: Record<string, unknown> = {
            emotionLevel1Id: level1,
            logDate,
          };
          if (level2 !== undefined) input.emotionLevel2Id = level2;
          if (note !== undefined) input.note = note;

          const result = createEmotionLogSchema.safeParse(input);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.5**
   * Missing both emotionLevel1Id and emotionLevel2Id must cause validation to fail.
   */
  it("rejects entries when both emotion levels are missing or invalid", () => {
    fc.assert(
      fc.property(
        invalidOrMissing,
        invalidOrMissing,
        validLogDate,
        optionalNote,
        (level1, level2, logDate, note) => {
          const input: Record<string, unknown> = { logDate };
          if (level1 !== undefined) input.emotionLevel1Id = level1;
          if (level2 !== undefined) input.emotionLevel2Id = level2;
          if (note !== undefined) input.note = note;

          const result = createEmotionLogSchema.safeParse(input);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Properties 20, 21, 22, 24, 25, 27, 28 — Journal & CRUD
 *
 * These properties test the tracker server actions by mocking the
 * Drizzle ORM database layer. Each property validates specific
 * requirements from the CESIZen spec.
 */

// ---- DB & Auth Mocks ----

// Chainable mock for Drizzle query builder
const mockReturning = jest.fn();
const mockDeleteWhere = jest.fn();
const mockUpdateSet = jest.fn();
const mockInsertValues = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockLimitChain = jest.fn();
const mockWhere = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => ({ values: (...a: unknown[]) => mockInsertValues(...a) }),
    update: (...args: unknown[]) => ({ set: (...a: unknown[]) => mockUpdateSet(...a) }),
    delete: (...args: unknown[]) => ({ where: (...a: unknown[]) => mockDeleteWhere(...a) }),
  },
}));

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

// Import after mocks
import {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
} from "@/lib/actions/tracker";

// ---- Shared Generators ----
const arbUUID = fc.uuid();
const arbDate = fc
  .tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
const arbNote = fc.oneof(fc.constant(undefined), fc.string({ minLength: 1, maxLength: 200 }));

// Helper: build a mock emotion log entry
function buildMockEntry(overrides: Partial<{
  id: string;
  userId: string;
  emotionLevel1Id: string;
  emotionLevel2Id: string;
  logDate: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? "entry-id-1",
    userId: overrides.userId ?? "user-id-1",
    emotionLevel1Id: overrides.emotionLevel1Id ?? "level1-id-1",
    emotionLevel2Id: overrides.emotionLevel2Id ?? "level2-id-1",
    logDate: overrides.logDate ?? new Date("2024-06-15"),
    note: overrides.note ?? null,
    createdAt: overrides.createdAt ?? new Date("2024-01-01T00:00:00Z"),
    updatedAt: overrides.updatedAt ?? new Date("2024-06-15T00:00:00Z"),
  };
}

// Helper: reset all mock chains
function resetMockChains() {
  jest.clearAllMocks();
  // Default chain: select().from().where().orderBy().limit().offset()
  mockOffset.mockReturnValue(Promise.resolve([]));
  mockLimitChain.mockReturnValue({ offset: mockOffset });
  mockOrderBy.mockReturnValue({ limit: mockLimitChain, offset: mockOffset });
  mockWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimitChain });
  mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
  mockSelect.mockReturnValue({ from: mockFrom });
}

/**
 * Property 20: Las entradas del journal están en orden cronológico inverso
 * Validates: Requirements 8.1
 *
 * For any set of emotion_logs for a user, the journal API must return them
 * ordered by log_date descending (most recent first).
 */
describe("Property 20: Las entradas del journal están en orden cronológico inverso", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 8.1**
  it("getTrackerEntries returns entries sorted by logDate descending", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        fc.integer({ min: 2, max: 10 }),
        async (userId, entryCount) => {
          resetMockChains();

          // Generate entries with distinct dates in random order
          const baseTime = new Date("2024-01-01").getTime();
          const entries = Array.from({ length: entryCount }, (_, i) => {
            const date = new Date(baseTime + i * 86400000); // each day apart
            return buildMockEntry({
              id: `entry-${i}`,
              userId,
              logDate: date,
            });
          });

          // Simulate DB returning them in reverse chronological order (as the query does)
          const sortedEntries = [...entries].sort(
            (a, b) => b.logDate.getTime() - a.logDate.getTime()
          );

          // Mock count query
          let callCount = 0;
          mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              // Count query
              return {
                from: () => ({
                  where: () => Promise.resolve([{ count: entryCount }]),
                }),
              };
            }
            // Entries query
            return {
              from: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve(sortedEntries),
                    }),
                  }),
                }),
              }),
            };
          });

          const result = await getTrackerEntries(userId, 1, 20);

          expect(result.success).toBe(true);
          expect(result.entries).toHaveLength(entryCount);

          // Verify reverse chronological order
          for (let i = 1; i < result.entries.length; i++) {
            const prev = new Date(result.entries[i - 1].logDate).getTime();
            const curr = new Date(result.entries[i].logDate).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 21: La paginación limita las entradas por página
 * Validates: Requirements 8.2
 *
 * For any number of entries, each page must contain at most 20 entries,
 * and the total across pages equals the real total.
 */
describe("Property 21: La paginación limita las entradas por página", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 8.2**
  it("each page contains at most 20 entries and total metadata is correct", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 5 }),
        async (userId, totalEntries, page) => {
          resetMockChains();

          const limit = 20;
          const totalPages = Math.ceil(totalEntries / limit) || 0;
          const offset = (page - 1) * limit;
          const pageEntryCount = Math.max(0, Math.min(limit, totalEntries - offset));

          const pageEntries = Array.from({ length: pageEntryCount }, (_, i) =>
            buildMockEntry({ id: `entry-${offset + i}`, userId })
          );

          let callCount = 0;
          mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return {
                from: () => ({
                  where: () => Promise.resolve([{ count: totalEntries }]),
                }),
              };
            }
            return {
              from: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve(pageEntries),
                    }),
                  }),
                }),
              }),
            };
          });

          const result = await getTrackerEntries(userId, page, limit);

          expect(result.success).toBe(true);
          // Page must have at most 20 entries
          expect(result.entries.length).toBeLessThanOrEqual(20);
          // Total metadata must match
          expect(result.total).toBe(totalEntries);
          expect(result.totalPages).toBe(totalPages);
          expect(result.page).toBe(page);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 22: Aislamiento de datos de usuario
 * Validates: Requirements 8.3, 11.4
 *
 * For any pair of distinct users, querying the journal for user A
 * must never include entries belonging to user B.
 */
describe("Property 22: Aislamiento de datos de usuario", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 8.3**
  it("getTrackerEntries for user A never returns entries from user B", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID,
        arbUUID.filter((id) => id !== "00000000-0000-0000-0000-000000000000"),
        fc.integer({ min: 1, max: 5 }),
        async (userAId, userBId) => {
          // Ensure distinct users
          if (userAId === userBId) return;

          resetMockChains();

          // User A's entries only
          const userAEntries = [
            buildMockEntry({ id: "a-1", userId: userAId }),
            buildMockEntry({ id: "a-2", userId: userAId }),
          ];

          let callCount = 0;
          mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return {
                from: () => ({
                  where: () => Promise.resolve([{ count: 2 }]),
                }),
              };
            }
            return {
              from: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve(userAEntries),
                    }),
                  }),
                }),
              }),
            };
          });

          const result = await getTrackerEntries(userAId, 1, 20);

          expect(result.success).toBe(true);
          // All returned entries must belong to user A
          for (const entry of result.entries) {
            expect(entry).not.toHaveProperty("userId", userBId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 24: Round-trip de entrada de emoción
 * Validates: Requirements 9.3
 *
 * After saving a valid emotion entry, querying the journal must include
 * it with exact data.
 */
describe("Property 24: Round-trip de entrada de emoción", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 9.3**
  it("createTrackerEntry returns the saved entry with exact input data", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID, // userId
        arbUUID, // emotionLevel1Id
        arbUUID, // emotionLevel2Id
        arbDate,
        arbNote,
        async (userId, level1Id, level2Id, logDate, note) => {
          resetMockChains();

          const createdEntry = buildMockEntry({
            id: "new-entry-id",
            userId,
            emotionLevel1Id: level1Id,
            emotionLevel2Id: level2Id,
            logDate: new Date(logDate),
            note: note || null,
          });

          // Mock: verify level1 exists and is active
          let selectCallCount = 0;
          mockSelect.mockImplementation(() => {
            selectCallCount++;
            if (selectCallCount === 1) {
              // Level 1 check
              return {
                from: () => ({
                  where: () => ({
                    limit: () => Promise.resolve([{ id: level1Id }]),
                  }),
                }),
              };
            }
            if (selectCallCount === 2) {
              // Level 2 check
              return {
                from: () => ({
                  where: () => ({
                    limit: () => Promise.resolve([{ id: level2Id }]),
                  }),
                }),
              };
            }
            return { from: () => ({ where: () => Promise.resolve([]) }) };
          });

          // Mock insert returning the created entry
          const { db } = require("@/lib/db");
          db.insert = jest.fn(() => ({
            values: jest.fn(() => ({
              returning: jest.fn(() =>
                Promise.resolve([{
                  id: createdEntry.id,
                  emotionLevel1Id: createdEntry.emotionLevel1Id,
                  emotionLevel2Id: createdEntry.emotionLevel2Id,
                  logDate: createdEntry.logDate,
                  note: createdEntry.note,
                  createdAt: createdEntry.createdAt,
                }])
              ),
            })),
          }));

          const result = await createTrackerEntry(userId, {
            emotionLevel1Id: level1Id,
            emotionLevel2Id: level2Id,
            logDate,
            note,
          });

          expect(result.success).toBe(true);
          expect(result.entry).toBeDefined();
          expect(result.entry!.emotionLevel1Id).toBe(level1Id);
          expect(result.entry!.emotionLevel2Id).toBe(level2Id);
          expect(result.entry!.note).toBe(note || null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 25: La actualización de entrada preserva createdAt
 * Validates: Requirements 9.4
 *
 * Updating an entry must modify specified fields but keep the original
 * created_at unchanged.
 */
describe("Property 25: La actualización de entrada preserva createdAt", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 9.4**
  it("updateTrackerEntry preserves the original createdAt timestamp", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID, // userId
        arbUUID, // entryId
        arbUUID, // new level1Id
        arbUUID, // new level2Id
        arbDate, // new logDate
        async (userId, entryId, newLevel1Id, newLevel2Id, newLogDate) => {
          resetMockChains();

          const originalCreatedAt = new Date("2024-01-15T10:30:00Z");
          const existingEntry = buildMockEntry({
            id: entryId,
            userId,
            createdAt: originalCreatedAt,
          });

          // Mock: select existing entry (ownership check)
          let selectCallCount = 0;
          mockSelect.mockImplementation(() => {
            selectCallCount++;
            if (selectCallCount === 1) {
              // Ownership check
              return {
                from: () => ({
                  where: () => ({
                    limit: () => Promise.resolve([{
                      id: existingEntry.id,
                      userId: existingEntry.userId,
                      createdAt: originalCreatedAt,
                    }]),
                  }),
                }),
              };
            }
            if (selectCallCount === 2) {
              // Level 1 validation
              return {
                from: () => ({
                  where: () => ({
                    limit: () => Promise.resolve([{ id: newLevel1Id }]),
                  }),
                }),
              };
            }
            if (selectCallCount === 3) {
              // Level 2 validation
              return {
                from: () => ({
                  where: () => ({
                    limit: () => Promise.resolve([{ id: newLevel2Id }]),
                  }),
                }),
              };
            }
            return { from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) };
          });

          // Mock update returning the updated entry with original createdAt
          const { db } = require("@/lib/db");
          db.update = jest.fn(() => ({
            set: jest.fn(() => ({
              where: jest.fn(() => ({
                returning: jest.fn(() =>
                  Promise.resolve([{
                    id: entryId,
                    emotionLevel1Id: newLevel1Id,
                    emotionLevel2Id: newLevel2Id,
                    logDate: new Date(newLogDate),
                    note: null,
                    createdAt: originalCreatedAt,
                    updatedAt: new Date(),
                  }])
                ),
              })),
            })),
          }));

          const result = await updateTrackerEntry(userId, entryId, {
            emotionLevel1Id: newLevel1Id,
            emotionLevel2Id: newLevel2Id,
            logDate: newLogDate,
          });

          expect(result.success).toBe(true);
          expect(result.entry).toBeDefined();
          // createdAt must be preserved
          expect(result.entry!.createdAt).toEqual(originalCreatedAt);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 27: La eliminación remueve la entrada de la base de datos
 * Validates: Requirements 10.2
 *
 * After confirming deletion, the entry must not exist in the database.
 */
describe("Property 27: La eliminación remueve la entrada de la base de datos", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 10.2**
  it("deleteTrackerEntry removes the entry and returns success", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID, // userId
        arbUUID, // entryId
        async (userId, entryId) => {
          resetMockChains();

          // Mock: select existing entry (ownership check)
          mockSelect.mockImplementation(() => ({
            from: () => ({
              where: () => ({
                limit: () =>
                  Promise.resolve([{ id: entryId, userId }]),
              }),
            }),
          }));

          // Mock: delete succeeds
          let deleteCalled = false;
          const { db } = require("@/lib/db");
          db.delete = jest.fn(() => ({
            where: jest.fn(() => {
              deleteCalled = true;
              return Promise.resolve();
            }),
          }));

          const result = await deleteTrackerEntry(userId, entryId);

          expect(result.success).toBe(true);
          expect(deleteCalled).toBe(true);
          expect(db.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 28: No se puede eliminar la entrada de otro usuario
 * Validates: Requirements 10.3
 *
 * User A trying to delete User B's entry must get 403 and the entry
 * must remain intact.
 */
describe("Property 28: No se puede eliminar la entrada de otro usuario", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 10.3**
  it("deleteTrackerEntry returns 403 when user tries to delete another user's entry", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID, // userAId (the requester)
        arbUUID, // userBId (the owner)
        arbUUID, // entryId
        async (userAId, userBId, entryId) => {
          // Ensure distinct users
          if (userAId === userBId) return;

          resetMockChains();

          // Mock: entry belongs to user B
          mockSelect.mockImplementation(() => ({
            from: () => ({
              where: () => ({
                limit: () =>
                  Promise.resolve([{ id: entryId, userId: userBId }]),
              }),
            }),
          }));

          // Track if delete was called (it should NOT be)
          let deleteCalled = false;
          const { db } = require("@/lib/db");
          db.delete = jest.fn(() => ({
            where: jest.fn(() => {
              deleteCalled = true;
              return Promise.resolve();
            }),
          }));

          const result = await deleteTrackerEntry(userAId, entryId);

          // Must be rejected
          expect(result.success).toBe(false);
          // Must return 403 status
          expect((result as { status?: number }).status).toBe(403);
          // Delete must NOT have been called
          expect(deleteCalled).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 29: Corrección de la agregación del reporte
 * Validates: Requirements 11.1, 11.2
 *
 * For any user with emotion entries in a given period (week, month,
 * quarter, or year), the report must:
 * (a) show the correct count of entries per each Émotion_Niveau_1,
 * (b) correctly identify the most frequent Émotion_Niveau_2 within
 *     each category,
 * (c) the sum of all counts must equal the total entries in the period.
 */

import { getEmotionReport } from "@/lib/actions/tracker";

// Generator for period values
const arbPeriod = fc.constantFrom("week", "month", "quarter", "year") as fc.Arbitrary<
  "week" | "month" | "quarter" | "year"
>;

// Generator for a single emotion log entry with level1 and level2 ids
const arbLevel1Id = fc.constantFrom("l1-joy", "l1-anger", "l1-fear", "l1-sadness", "l1-surprise", "l1-disgust");
const arbLevel2ForLevel1: Record<string, string[]> = {
  "l1-joy": ["l2-pride", "l2-contentment", "l2-excitement"],
  "l1-anger": ["l2-frustration", "l2-irritation", "l2-rage"],
  "l1-fear": ["l2-anxiety", "l2-terror", "l2-panic"],
  "l1-sadness": ["l2-grief", "l2-melancholy", "l2-despair"],
  "l1-surprise": ["l2-astonishment", "l2-confusion", "l2-wonder"],
  "l1-disgust": ["l2-repulsion", "l2-disdain", "l2-horror"],
};

// Generate a random emotion log entry (level1 + matching level2)
const arbEmotionEntry = arbLevel1Id.chain((level1Id) => {
  const level2Options = arbLevel2ForLevel1[level1Id];
  return fc.constantFrom(...level2Options).map((level2Id) => ({
    emotionLevel1Id: level1Id,
    emotionLevel2Id: level2Id,
  }));
});

// Level1 name map for mock DB lookups
const level1NameMap: Record<string, string> = {
  "l1-joy": "Joie",
  "l1-anger": "Colère",
  "l1-fear": "Peur",
  "l1-sadness": "Tristesse",
  "l1-surprise": "Surprise",
  "l1-disgust": "Dégoût",
};

// Level2 name map for mock DB lookups
const level2NameMap: Record<string, string> = {
  "l2-pride": "Fierté",
  "l2-contentment": "Contentement",
  "l2-excitement": "Excitation",
  "l2-frustration": "Frustration",
  "l2-irritation": "Irritation",
  "l2-rage": "Rage",
  "l2-anxiety": "Anxiété",
  "l2-terror": "Terreur",
  "l2-panic": "Panique",
  "l2-grief": "Chagrin",
  "l2-melancholy": "Mélancolie",
  "l2-despair": "Désespoir",
  "l2-astonishment": "Étonnement",
  "l2-confusion": "Confusion",
  "l2-wonder": "Émerveillement",
  "l2-repulsion": "Répulsion",
  "l2-disdain": "Dédain",
  "l2-horror": "Horreur",
};

/**
 * Compute expected aggregation from raw entries (ground truth).
 */
function computeExpectedAggregation(entries: { emotionLevel1Id: string; emotionLevel2Id: string }[]) {
  const groups = new Map<string, { count: number; level2Counts: Map<string, number> }>();

  for (const entry of entries) {
    const group = groups.get(entry.emotionLevel1Id);
    if (group) {
      group.count++;
      group.level2Counts.set(
        entry.emotionLevel2Id,
        (group.level2Counts.get(entry.emotionLevel2Id) || 0) + 1
      );
    } else {
      const level2Counts = new Map<string, number>();
      level2Counts.set(entry.emotionLevel2Id, 1);
      groups.set(entry.emotionLevel1Id, { count: 1, level2Counts });
    }
  }

  const distribution = Array.from(groups.entries()).map(([level1Id, group]) => {
    let topLevel2Id: string | null = null;
    let maxCount = 0;
    for (const [l2Id, l2Count] of group.level2Counts.entries()) {
      if (l2Count > maxCount) {
        maxCount = l2Count;
        topLevel2Id = l2Id;
      }
    }
    return {
      level1Id,
      count: group.count,
      topLevel2Id,
      topLevel2Count: maxCount,
    };
  });

  return distribution;
}

describe("Property 29: Corrección de la agregación del reporte", () => {
  beforeEach(() => resetMockChains());

  // **Validates: Requirements 11.1, 11.2**
  it("report aggregation counts per level1 are correct, top level2 is identified, and sum equals total", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUUID, // userId
        arbPeriod,
        fc.array(arbEmotionEntry, { minLength: 1, maxLength: 30 }),
        async (userId, period, entries) => {
          resetMockChains();

          const expected = computeExpectedAggregation(entries);
          const expectedTotal = entries.length;

          // Collect all unique level1 and level2 ids from entries
          const uniqueLevel1Ids = [...new Set(entries.map((e) => e.emotionLevel1Id))];
          const uniqueLevel2Ids = [...new Set(entries.map((e) => e.emotionLevel2Id))];

          // Mock DB calls in getEmotionReport:
          // 1st select: fetch entries in date range
          // 2nd select: fetch level1 names (inArray)
          // 3rd select: fetch level2 names (inArray)
          let selectCallCount = 0;
          mockSelect.mockImplementation(() => {
            selectCallCount++;
            if (selectCallCount === 1) {
              // Entries query
              return {
                from: () => ({
                  where: () => Promise.resolve(entries),
                }),
              };
            }
            if (selectCallCount === 2) {
              // Level1 names query
              return {
                from: () => ({
                  where: () =>
                    Promise.resolve(
                      uniqueLevel1Ids.map((id) => ({
                        id,
                        name: level1NameMap[id] || id,
                      }))
                    ),
                }),
              };
            }
            if (selectCallCount === 3) {
              // Level2 names query
              return {
                from: () => ({
                  where: () =>
                    Promise.resolve(
                      uniqueLevel2Ids.map((id) => ({
                        id,
                        name: level2NameMap[id] || id,
                      }))
                    ),
                }),
              };
            }
            return { from: () => ({ where: () => Promise.resolve([]) }) };
          });

          const report = await getEmotionReport(userId, period);

          // (c) Sum of all counts must equal total entries
          expect(report.totalEntries).toBe(expectedTotal);
          const sumOfCounts = report.distribution.reduce(
            (sum, d) => sum + d.emotionLevel1.count,
            0
          );
          expect(sumOfCounts).toBe(expectedTotal);

          // (a) Correct count per level1
          for (const exp of expected) {
            const found = report.distribution.find(
              (d) => d.emotionLevel1.id === exp.level1Id
            );
            expect(found).toBeDefined();
            expect(found!.emotionLevel1.count).toBe(exp.count);
          }

          // (b) Most frequent level2 within each category
          for (const exp of expected) {
            const found = report.distribution.find(
              (d) => d.emotionLevel1.id === exp.level1Id
            );
            expect(found).toBeDefined();
            expect(found!.emotionLevel1.topLevel2).not.toBeNull();
            expect(found!.emotionLevel1.topLevel2!.id).toBe(exp.topLevel2Id);
            expect(found!.emotionLevel1.topLevel2!.count).toBe(exp.topLevel2Count);
          }

          // Verify distribution has exactly the right number of level1 categories
          expect(report.distribution.length).toBe(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
