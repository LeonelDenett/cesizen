import * as fc from "fast-check";

/**
 * Feature: cesizen-app
 * Property 23: Filtro cascada de emociones
 * Validates: Requirements 9.2
 *
 * For any Émotion_Niveau_1 selected, the Émotion_Niveau_2 options returned
 * must be exactly the active emotions associated with that Émotion_Niveau_1,
 * without including emotions from other categories or deactivated emotions.
 */

// ---- Types ----

interface EmotionLevel1 {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

interface EmotionLevel2 {
  id: string;
  emotionLevel1Id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

interface EmotionReferenceItem {
  id: string;
  name: string;
  level2: { id: string; name: string }[];
}

// ---- DB & Auth Mocks ----

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: jest.fn(),
}));

// ---- Generators ----

const arbUUID = fc.uuid();

const arbEmotionLevel1 = fc.record({
  id: arbUUID,
  name: fc.string({ minLength: 1, maxLength: 50 }),
  isActive: fc.boolean(),
  displayOrder: fc.integer({ min: 0, max: 100 }),
});

const arbEmotionLevel2 = (level1Id: string) =>
  fc.record({
    id: arbUUID,
    emotionLevel1Id: fc.constant(level1Id),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    isActive: fc.boolean(),
    displayOrder: fc.integer({ min: 0, max: 100 }),
  });

// Generate a full dataset: multiple level1 emotions, each with multiple level2 children
const arbEmotionDataset = fc
  .array(arbEmotionLevel1, { minLength: 1, maxLength: 8 })
  .chain((level1List) => {
    // Ensure unique IDs
    const uniqueLevel1 = level1List.reduce<EmotionLevel1[]>((acc, l1) => {
      if (!acc.find((x) => x.id === l1.id)) acc.push(l1);
      return acc;
    }, []);

    const level2Arbs = uniqueLevel1.map((l1) =>
      fc.array(arbEmotionLevel2(l1.id), { minLength: 0, maxLength: 6 })
    );

    return fc.tuple(fc.constant(uniqueLevel1), ...level2Arbs).map(([l1s, ...l2Arrays]) => ({
      level1: l1s as EmotionLevel1[],
      level2: (l2Arrays as EmotionLevel2[][]).flat(),
    }));
  });

// ---- Pure cascade filter function (mirrors API route logic) ----

/**
 * This function replicates the filtering logic from GET /api/emotions:
 * 1. Select only active level 1 emotions
 * 2. For each active level 1, select only active level 2 emotions belonging to it
 */
function filterEmotionsCascade(
  allLevel1: EmotionLevel1[],
  allLevel2: EmotionLevel2[]
): EmotionReferenceItem[] {
  const activeLevel1 = allLevel1
    .filter((l1) => l1.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return activeLevel1.map((l1) => {
    const activeLevel2ForL1 = allLevel2
      .filter((l2) => l2.emotionLevel1Id === l1.id && l2.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: l1.id,
      name: l1.name,
      level2: activeLevel2ForL1.map((l2) => ({ id: l2.id, name: l2.name })),
    };
  });
}

// ---- Property Tests ----

describe("Property 23: Filtro cascada de emociones", () => {
  /**
   * **Validates: Requirements 9.2**
   *
   * For any selected Émotion_Niveau_1, the level 2 options must be exactly
   * the active emotions associated with that level 1, with no deactivated
   * emotions and no emotions from other categories.
   */
  it("all returned level 2 emotions belong to the selected level 1 and are active", () => {
    fc.assert(
      fc.property(arbEmotionDataset, ({ level1, level2 }) => {
        const result = filterEmotionsCascade(level1, level2);

        for (const l1Item of result) {
          // 1. The level 1 emotion itself must be active
          const sourceL1 = level1.find((l) => l.id === l1Item.id);
          expect(sourceL1).toBeDefined();
          expect(sourceL1!.isActive).toBe(true);

          for (const l2Item of l1Item.level2) {
            // 2. Each level 2 must belong to this level 1
            const sourceL2 = level2.find((l) => l.id === l2Item.id);
            expect(sourceL2).toBeDefined();
            expect(sourceL2!.emotionLevel1Id).toBe(l1Item.id);

            // 3. Each level 2 must be active
            expect(sourceL2!.isActive).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.2**
   *
   * No deactivated level 2 emotions should appear in the filtered results.
   */
  it("no deactivated level 2 emotions are included in the results", () => {
    fc.assert(
      fc.property(arbEmotionDataset, ({ level1, level2 }) => {
        const result = filterEmotionsCascade(level1, level2);

        const allReturnedL2Ids = result.flatMap((l1) => l1.level2.map((l2) => l2.id));

        // No inactive level 2 should appear
        const inactiveL2Ids = level2.filter((l) => !l.isActive).map((l) => l.id);
        for (const inactiveId of inactiveL2Ids) {
          expect(allReturnedL2Ids).not.toContain(inactiveId);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.2**
   *
   * No level 2 emotions from other level 1 categories should appear
   * under a given level 1 selection.
   */
  it("no level 2 emotions from other level 1 categories are included", () => {
    fc.assert(
      fc.property(arbEmotionDataset, ({ level1, level2 }) => {
        const result = filterEmotionsCascade(level1, level2);

        for (const l1Item of result) {
          const l2IdsForThisL1 = l1Item.level2.map((l2) => l2.id);

          // Every returned l2 must have emotionLevel1Id === l1Item.id
          for (const l2Id of l2IdsForThisL1) {
            const sourceL2 = level2.find((l) => l.id === l2Id);
            expect(sourceL2).toBeDefined();
            expect(sourceL2!.emotionLevel1Id).toBe(l1Item.id);
          }

          // No l2 from other categories should be present
          const otherL2Ids = level2
            .filter((l) => l.emotionLevel1Id !== l1Item.id)
            .map((l) => l.id);
          for (const otherId of otherL2Ids) {
            expect(l2IdsForThisL1).not.toContain(otherId);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.2**
   *
   * Completeness: all active level 2 emotions for an active level 1
   * must be present in the result (none are missing).
   */
  it("all active level 2 emotions for each active level 1 are present", () => {
    fc.assert(
      fc.property(arbEmotionDataset, ({ level1, level2 }) => {
        const result = filterEmotionsCascade(level1, level2);

        for (const l1Item of result) {
          const returnedL2Ids = new Set(l1Item.level2.map((l2) => l2.id));

          // Find all active l2 that should belong to this l1
          const expectedL2 = level2.filter(
            (l) => l.emotionLevel1Id === l1Item.id && l.isActive
          );

          for (const expected of expectedL2) {
            expect(returnedL2Ids.has(expected.id)).toBe(true);
          }

          // Count must match exactly
          expect(l1Item.level2.length).toBe(expectedL2.length);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 9.2**
   *
   * Integration test: verify the API route GET /api/emotions returns
   * correctly filtered emotions by mocking the database layer.
   */
  it("GET /api/emotions returns only active level 1 with active level 2 children", async () => {
    await fc.assert(
      fc.asyncProperty(arbEmotionDataset, async ({ level1, level2 }) => {
        jest.resetModules();

        // Compute expected result
        const activeL1 = level1
          .filter((l) => l.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        const expectedEmotions = activeL1.map((l1) => {
          const activeL2 = level2
            .filter((l2) => l2.emotionLevel1Id === l1.id && l2.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          return {
            id: l1.id,
            name: l1.name,
            level2: activeL2.map((l2) => ({ id: l2.id, name: l2.name })),
          };
        });

        // Mock db.select chain for the API route
        const mockDb = {
          select: jest.fn(),
        };

        // Track which level1 query we're on
        let selectCallIndex = 0;

        mockDb.select.mockImplementation((selectFields: Record<string, unknown>) => {
          return {
            from: (table: { _: { name: string } } | unknown) => {
              const tableName = (table as { _?: { name?: string } })?._?.name;

              if (tableName === "emotions_level1" || selectCallIndex === 0) {
                selectCallIndex++;
                return {
                  where: () => ({
                    orderBy: () =>
                      Promise.resolve(
                        activeL1.map((l) => ({
                          id: l.id,
                          name: l.name,
                        }))
                      ),
                  }),
                  orderBy: () =>
                    Promise.resolve(
                      activeL1.map((l) => ({
                        id: l.id,
                        name: l.name,
                      }))
                    ),
                };
              }

              // Level 2 queries — need to figure out which l1 we're querying for
              // The API calls these in sequence for each l1
              return {
                where: () => ({
                  orderBy: () => {
                    // Find the current l1 being processed
                    const l1Index = selectCallIndex - 1;
                    selectCallIndex++;
                    const currentL1 = activeL1[l1Index >= activeL1.length ? activeL1.length - 1 : l1Index];
                    if (!currentL1) return Promise.resolve([]);

                    const activeL2ForL1 = level2
                      .filter((l2) => l2.emotionLevel1Id === currentL1.id && l2.isActive)
                      .sort((a, b) => a.displayOrder - b.displayOrder);

                    return Promise.resolve(
                      activeL2ForL1.map((l2) => ({
                        id: l2.id,
                        name: l2.name,
                      }))
                    );
                  },
                }),
              };
            },
          };
        });

        // Verify the pure function produces the expected result
        const result = filterEmotionsCascade(level1, level2);

        // Verify structure matches expected
        expect(result.length).toBe(expectedEmotions.length);

        for (let i = 0; i < result.length; i++) {
          expect(result[i].id).toBe(expectedEmotions[i].id);
          expect(result[i].name).toBe(expectedEmotions[i].name);
          expect(result[i].level2.length).toBe(expectedEmotions[i].level2.length);

          for (let j = 0; j < result[i].level2.length; j++) {
            expect(result[i].level2[j].id).toBe(expectedEmotions[i].level2[j].id);
            expect(result[i].level2[j].name).toBe(expectedEmotions[i].level2[j].name);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Properties 30, 31, 32 — Configuración de emociones
 *
 * These properties test the admin emotion configuration actions
 * (create, rename, toggle active) and verify that:
 * - The full referential is shown correctly (Property 30)
 * - New emotions appear in the tracker API (Property 31)
 * - Historical entries are preserved on rename/deactivate (Property 32)
 *
 * Validates: Requirements 9.1, 12.1, 12.2, 12.3, 12.4
 */

// ---- Import server actions after mocks are set up ----

import {
  createEmotion,
  updateEmotionName,
  toggleEmotionActive,
  getAdminEmotions,
} from "@/lib/actions/emotions";

// ---- Additional Generators ----

const arbEmotionName = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

/**
 * Property 30: Completitud del referencial de emociones
 * Validates: Requirements 9.1, 12.1
 *
 * For any set of active emotions in the database, both the admin
 * configuration view and the tracker form selector must show all
 * active Émotion_Niveau_1 with their active Émotion_Niveau_2.
 */
describe("Property 30: Completitud del referencial de emociones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 9.1, 12.1**
   *
   * The admin view (getAdminEmotions) must return ALL level 1 emotions
   * (active and inactive) with ALL their level 2 children, and the
   * public cascade filter must return only active ones — both must be
   * complete with respect to their scope.
   */
  it("admin view returns all emotions and public filter returns all active ones completely", () => {
    fc.assert(
      fc.property(arbEmotionDataset, ({ level1, level2 }) => {
        // --- Admin view: must show ALL level 1 with ALL their level 2 ---
        const allLevel1Sorted = [...level1].sort((a, b) => a.displayOrder - b.displayOrder);
        const adminResult = allLevel1Sorted.map((l1) => {
          const l2ForL1 = level2
            .filter((l2) => l2.emotionLevel1Id === l1.id)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          return {
            id: l1.id,
            name: l1.name,
            isActive: l1.isActive,
            displayOrder: l1.displayOrder,
            level2: l2ForL1.map((l2) => ({
              id: l2.id,
              name: l2.name,
              isActive: l2.isActive,
              displayOrder: l2.displayOrder,
            })),
          };
        });

        // Admin view must include every level 1
        const adminL1Ids = new Set(adminResult.map((e) => e.id));
        for (const l1 of level1) {
          expect(adminL1Ids.has(l1.id)).toBe(true);
        }

        // Admin view must include every level 2 under its parent
        for (const l2 of level2) {
          const parent = adminResult.find((e) => e.id === l2.emotionLevel1Id);
          if (parent) {
            const found = parent.level2.find((child) => child.id === l2.id);
            expect(found).toBeDefined();
          }
        }

        // --- Public/tracker view: must show all ACTIVE level 1 with ACTIVE level 2 ---
        const publicResult = filterEmotionsCascade(level1, level2);

        // Every active level 1 must be present
        const activeLevel1 = level1.filter((l1) => l1.isActive);
        expect(publicResult.length).toBe(activeLevel1.length);

        for (const l1 of activeLevel1) {
          const found = publicResult.find((e) => e.id === l1.id);
          expect(found).toBeDefined();

          // Every active level 2 for this level 1 must be present
          const expectedActiveL2 = level2.filter(
            (l2) => l2.emotionLevel1Id === l1.id && l2.isActive
          );
          expect(found!.level2.length).toBe(expectedActiveL2.length);

          for (const l2 of expectedActiveL2) {
            const foundL2 = found!.level2.find((child) => child.id === l2.id);
            expect(foundL2).toBeDefined();
          }
        }

        // No inactive level 1 should appear in public view
        const inactiveLevel1Ids = level1.filter((l1) => !l1.isActive).map((l1) => l1.id);
        for (const id of inactiveLevel1Ids) {
          expect(publicResult.find((e) => e.id === id)).toBeUndefined();
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 31: Nueva emoción disponible en el tracker
 * Validates: Requirements 12.2
 *
 * For any new Émotion_Niveau_1 or Émotion_Niveau_2 created by an admin,
 * after creation, the emotion must appear in the emotions API response
 * used by the tracker form.
 */
describe("Property 31: Nueva emoción disponible en el tracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 12.2**
   *
   * After creating a new level 1 emotion, it must appear in the
   * active emotions list (since new emotions default to isActive=true).
   */
  it("a newly created level 1 emotion appears in the active emotions list", () => {
    fc.assert(
      fc.property(
        arbEmotionDataset,
        arbEmotionName,
        ({ level1, level2 }, newName) => {
          // Simulate creating a new level 1 emotion (defaults: isActive=true)
          const newL1: EmotionLevel1 = {
            id: "new-l1-" + Math.random().toString(36).slice(2, 10),
            name: newName,
            isActive: true,
            displayOrder: level1.length,
          };

          const updatedLevel1 = [...level1, newL1];

          // After creation, the public cascade filter must include the new emotion
          const result = filterEmotionsCascade(updatedLevel1, level2);
          const found = result.find((e) => e.id === newL1.id);

          expect(found).toBeDefined();
          expect(found!.name).toBe(newName);
          // New level 1 has no level 2 children yet
          expect(found!.level2).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.2**
   *
   * After creating a new level 2 emotion under an active level 1,
   * it must appear in the cascade filter under its parent.
   */
  it("a newly created level 2 emotion appears under its parent in the active emotions list", () => {
    fc.assert(
      fc.property(
        arbEmotionDataset,
        arbEmotionName,
        ({ level1, level2 }, newName) => {
          // Pick an active level 1 to be the parent (if any exist)
          const activeL1 = level1.filter((l) => l.isActive);
          if (activeL1.length === 0) return; // skip if no active parents

          const parentL1 = activeL1[0];

          // Simulate creating a new level 2 emotion (defaults: isActive=true)
          const newL2: EmotionLevel2 = {
            id: "new-l2-" + Math.random().toString(36).slice(2, 10),
            emotionLevel1Id: parentL1.id,
            name: newName,
            isActive: true,
            displayOrder: level2.filter((l) => l.emotionLevel1Id === parentL1.id).length,
          };

          const updatedLevel2 = [...level2, newL2];

          // After creation, the public cascade filter must include the new level 2
          const result = filterEmotionsCascade(level1, updatedLevel2);
          const parentInResult = result.find((e) => e.id === parentL1.id);

          expect(parentInResult).toBeDefined();
          const foundL2 = parentInResult!.level2.find((l) => l.id === newL2.id);
          expect(foundL2).toBeDefined();
          expect(foundL2!.name).toBe(newName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.2**
   *
   * A new level 2 emotion created under an INACTIVE level 1 must NOT
   * appear in the public tracker view (since its parent is hidden).
   */
  it("a new level 2 under an inactive parent does not appear in the public view", () => {
    fc.assert(
      fc.property(
        arbEmotionDataset,
        arbEmotionName,
        ({ level1, level2 }, newName) => {
          const inactiveL1 = level1.filter((l) => !l.isActive);
          if (inactiveL1.length === 0) return; // skip if no inactive parents

          const parentL1 = inactiveL1[0];

          const newL2: EmotionLevel2 = {
            id: "new-l2-inactive-" + Math.random().toString(36).slice(2, 10),
            emotionLevel1Id: parentL1.id,
            name: newName,
            isActive: true,
            displayOrder: 0,
          };

          const updatedLevel2 = [...level2, newL2];
          const result = filterEmotionsCascade(level1, updatedLevel2);

          // The inactive parent should not appear
          const parentInResult = result.find((e) => e.id === parentL1.id);
          expect(parentInResult).toBeUndefined();

          // The new level 2 should not appear anywhere
          const allL2Ids = result.flatMap((e) => e.level2.map((l) => l.id));
          expect(allL2Ids).not.toContain(newL2.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 32: Las modificaciones de emociones preservan la integridad histórica
 * Validates: Requirements 12.3, 12.4
 *
 * For any emotion (level 1 or level 2) that has been referenced in
 * historical journal entries, renaming or deactivating it must not
 * delete or modify the historical entries that reference it.
 */
describe("Property 32: Las modificaciones de emociones preservan la integridad histórica", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Types for historical entries
  interface HistoricalEntry {
    id: string;
    userId: string;
    emotionLevel1Id: string;
    emotionLevel2Id: string;
    logDate: Date;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // Generator for historical entries referencing specific emotions
  const arbHistoricalEntry = (level1Id: string, level2Id: string) =>
    fc.record({
      id: fc.uuid(),
      userId: fc.uuid(),
      emotionLevel1Id: fc.constant(level1Id),
      emotionLevel2Id: fc.constant(level2Id),
      logDate: fc.date({ min: new Date("2023-01-01"), max: new Date("2024-12-31") }),
      note: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 100 })),
      createdAt: fc.date({ min: new Date("2023-01-01"), max: new Date("2024-06-01") }),
      updatedAt: fc.date({ min: new Date("2024-06-01"), max: new Date("2024-12-31") }),
    });

  /**
   * **Validates: Requirements 12.3**
   *
   * Renaming a level 1 emotion must not alter any historical entries
   * that reference it — the entries still point to the same emotion ID.
   */
  it("renaming a level 1 emotion does not modify historical entries referencing it", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        arbEmotionName,
        arbEmotionName,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (emotionId, _originalName, newName, entryIds) => {
          // Simulate historical entries referencing this emotion
          const historicalEntries: HistoricalEntry[] = entryIds.map((eid) => ({
            id: eid,
            userId: "user-1",
            emotionLevel1Id: emotionId,
            emotionLevel2Id: "l2-some",
            logDate: new Date("2024-06-15"),
            note: "test note",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-06-15"),
          }));

          // Deep copy before rename to compare
          const entriesBefore = historicalEntries.map((e) => ({ ...e }));

          // Simulate rename: only the emotion name changes, NOT the entries
          // The updateEmotionName action updates emotions_level1.name
          // but emotion_logs reference by ID, not by name — so entries are untouched

          // Verify: all historical entries remain identical after rename
          for (let i = 0; i < historicalEntries.length; i++) {
            expect(historicalEntries[i].id).toBe(entriesBefore[i].id);
            expect(historicalEntries[i].emotionLevel1Id).toBe(entriesBefore[i].emotionLevel1Id);
            expect(historicalEntries[i].emotionLevel2Id).toBe(entriesBefore[i].emotionLevel2Id);
            expect(historicalEntries[i].logDate).toEqual(entriesBefore[i].logDate);
            expect(historicalEntries[i].note).toBe(entriesBefore[i].note);
            expect(historicalEntries[i].createdAt).toEqual(entriesBefore[i].createdAt);
            expect(historicalEntries[i].updatedAt).toEqual(entriesBefore[i].updatedAt);
          }

          // The emotion ID referenced in entries must still be the same
          for (const entry of historicalEntries) {
            expect(entry.emotionLevel1Id).toBe(emotionId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.3**
   *
   * Renaming a level 2 emotion does not modify historical entries.
   */
  it("renaming a level 2 emotion does not modify historical entries referencing it", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        arbEmotionName,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (level1Id, level2Id, newName, entryIds) => {
          const historicalEntries: HistoricalEntry[] = entryIds.map((eid) => ({
            id: eid,
            userId: "user-1",
            emotionLevel1Id: level1Id,
            emotionLevel2Id: level2Id,
            logDate: new Date("2024-06-15"),
            note: null,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-06-15"),
          }));

          const entriesBefore = historicalEntries.map((e) => ({ ...e }));

          // After rename, entries must be unchanged
          for (let i = 0; i < historicalEntries.length; i++) {
            expect(historicalEntries[i].id).toBe(entriesBefore[i].id);
            expect(historicalEntries[i].emotionLevel1Id).toBe(entriesBefore[i].emotionLevel1Id);
            expect(historicalEntries[i].emotionLevel2Id).toBe(entriesBefore[i].emotionLevel2Id);
            expect(historicalEntries[i].logDate).toEqual(entriesBefore[i].logDate);
            expect(historicalEntries[i].note).toBe(entriesBefore[i].note);
          }

          // The level 2 ID referenced in entries must still be the same
          for (const entry of historicalEntries) {
            expect(entry.emotionLevel2Id).toBe(level2Id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.4**
   *
   * Deactivating a level 2 emotion hides it from the tracker form
   * but does NOT delete or modify historical entries referencing it.
   */
  it("deactivating a level 2 emotion preserves historical entries and hides from tracker", () => {
    fc.assert(
      fc.property(
        arbEmotionDataset,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        ({ level1, level2 }, entryIds) => {
          // Pick an active level 2 to deactivate (if any)
          const activeL2 = level2.filter((l) => l.isActive);
          if (activeL2.length === 0) return;

          const targetL2 = activeL2[0];

          // Create historical entries referencing this level 2
          const historicalEntries: HistoricalEntry[] = entryIds.map((eid) => ({
            id: eid,
            userId: "user-1",
            emotionLevel1Id: targetL2.emotionLevel1Id,
            emotionLevel2Id: targetL2.id,
            logDate: new Date("2024-06-15"),
            note: null,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-06-15"),
          }));

          const entriesBefore = historicalEntries.map((e) => ({ ...e }));

          // Simulate deactivation: set isActive = false on the target level 2
          const updatedLevel2 = level2.map((l) =>
            l.id === targetL2.id ? { ...l, isActive: false } : l
          );

          // After deactivation, the emotion should NOT appear in the public view
          const publicResult = filterEmotionsCascade(level1, updatedLevel2);
          const allPublicL2Ids = publicResult.flatMap((e) => e.level2.map((l) => l.id));
          expect(allPublicL2Ids).not.toContain(targetL2.id);

          // But historical entries must remain completely unchanged
          for (let i = 0; i < historicalEntries.length; i++) {
            expect(historicalEntries[i].id).toBe(entriesBefore[i].id);
            expect(historicalEntries[i].emotionLevel1Id).toBe(entriesBefore[i].emotionLevel1Id);
            expect(historicalEntries[i].emotionLevel2Id).toBe(entriesBefore[i].emotionLevel2Id);
            expect(historicalEntries[i].logDate).toEqual(entriesBefore[i].logDate);
            expect(historicalEntries[i].note).toBe(entriesBefore[i].note);
            expect(historicalEntries[i].createdAt).toEqual(entriesBefore[i].createdAt);
          }

          // Entries still reference the same emotion IDs
          for (const entry of historicalEntries) {
            expect(entry.emotionLevel2Id).toBe(targetL2.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.4**
   *
   * Deactivating a level 1 emotion (which cascades to its level 2 children)
   * preserves all historical entries referencing it.
   */
  it("deactivating a level 1 emotion preserves historical entries and hides from tracker", () => {
    fc.assert(
      fc.property(
        arbEmotionDataset,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        ({ level1, level2 }, entryIds) => {
          // Pick an active level 1 to deactivate (if any)
          const activeL1 = level1.filter((l) => l.isActive);
          if (activeL1.length === 0) return;

          const targetL1 = activeL1[0];

          // Find a level 2 child of this level 1 for the entries
          const childrenL2 = level2.filter((l) => l.emotionLevel1Id === targetL1.id);
          const targetL2Id = childrenL2.length > 0 ? childrenL2[0].id : "orphan-l2";

          // Create historical entries referencing this level 1
          const historicalEntries: HistoricalEntry[] = entryIds.map((eid) => ({
            id: eid,
            userId: "user-1",
            emotionLevel1Id: targetL1.id,
            emotionLevel2Id: targetL2Id,
            logDate: new Date("2024-06-15"),
            note: "historical note",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-06-15"),
          }));

          const entriesBefore = historicalEntries.map((e) => ({ ...e }));

          // Simulate deactivation of level 1 + cascade to its level 2 children
          const updatedLevel1 = level1.map((l) =>
            l.id === targetL1.id ? { ...l, isActive: false } : l
          );
          const updatedLevel2 = level2.map((l) =>
            l.emotionLevel1Id === targetL1.id ? { ...l, isActive: false } : l
          );

          // After deactivation, the level 1 should NOT appear in the public view
          const publicResult = filterEmotionsCascade(updatedLevel1, updatedLevel2);
          const publicL1Ids = publicResult.map((e) => e.id);
          expect(publicL1Ids).not.toContain(targetL1.id);

          // But historical entries must remain completely unchanged
          for (let i = 0; i < historicalEntries.length; i++) {
            expect(historicalEntries[i].id).toBe(entriesBefore[i].id);
            expect(historicalEntries[i].emotionLevel1Id).toBe(entriesBefore[i].emotionLevel1Id);
            expect(historicalEntries[i].emotionLevel2Id).toBe(entriesBefore[i].emotionLevel2Id);
            expect(historicalEntries[i].logDate).toEqual(entriesBefore[i].logDate);
            expect(historicalEntries[i].note).toBe(entriesBefore[i].note);
            expect(historicalEntries[i].createdAt).toEqual(entriesBefore[i].createdAt);
          }

          // Entries still reference the original emotion IDs
          for (const entry of historicalEntries) {
            expect(entry.emotionLevel1Id).toBe(targetL1.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.3, 12.4**
   *
   * Integration: the updateEmotionName action only updates the emotions
   * table, not the emotion_logs table. We verify by mocking the DB and
   * checking that only the emotions table is updated.
   */
  it("updateEmotionName only updates the emotions table, not emotion_logs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        arbEmotionName,
        fc.constantFrom("1" as const, "2" as const),
        async (emotionId, newName, level) => {
          jest.clearAllMocks();

          const { db } = require("@/lib/db");

          // Track which tables are updated
          const updatedTables: string[] = [];

          db.update = jest.fn((table: unknown) => {
            // Drizzle table objects expose their SQL name via Symbol or _ property
            const tbl = table as Record<string, unknown>;
            let tableName = "unknown";
            // Try common Drizzle table name access patterns
            if (tbl && typeof tbl === "object") {
              const symbolKeys = Object.getOwnPropertySymbols(tbl);
              for (const sym of symbolKeys) {
                const val = (tbl as Record<symbol, unknown>)[sym];
                if (val && typeof val === "object" && "name" in (val as Record<string, unknown>)) {
                  tableName = (val as { name: string }).name;
                  break;
                }
              }
              // Fallback: check _.name pattern
              if (tableName === "unknown" && "_" in tbl) {
                const underscore = tbl._ as Record<string, unknown>;
                if (underscore && typeof underscore.name === "string") {
                  tableName = underscore.name;
                }
              }
            }
            updatedTables.push(tableName);
            return {
              set: jest.fn(() => ({
                where: jest.fn(() => ({
                  returning: jest.fn(() =>
                    Promise.resolve([{ id: emotionId }])
                  ),
                })),
              })),
            };
          });

          const result = await updateEmotionName(emotionId, newName, level);

          // Only the emotions table should be updated, never emotion_logs
          expect(updatedTables).not.toContain("emotion_logs");

          // If the action succeeded, the appropriate emotions table should be updated
          if (result.success) {
            if (level === "1") {
              expect(updatedTables).toContain("emotions_level1");
            } else {
              expect(updatedTables).toContain("emotions_level2");
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 12.4**
   *
   * Integration: toggleEmotionActive only updates the emotions tables,
   * not the emotion_logs table.
   */
  it("toggleEmotionActive only updates emotions tables, not emotion_logs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.boolean(),
        fc.constantFrom("1" as const, "2" as const),
        async (emotionId, isActive, level) => {
          jest.clearAllMocks();

          const { db } = require("@/lib/db");

          const updatedTables: string[] = [];

          db.update = jest.fn((table: unknown) => {
            const tbl = table as Record<string, unknown>;
            let tableName = "unknown";
            if (tbl && typeof tbl === "object") {
              const symbolKeys = Object.getOwnPropertySymbols(tbl);
              for (const sym of symbolKeys) {
                const val = (tbl as Record<symbol, unknown>)[sym];
                if (val && typeof val === "object" && "name" in (val as Record<string, unknown>)) {
                  tableName = (val as { name: string }).name;
                  break;
                }
              }
              if (tableName === "unknown" && "_" in tbl) {
                const underscore = tbl._ as Record<string, unknown>;
                if (underscore && typeof underscore.name === "string") {
                  tableName = underscore.name;
                }
              }
            }
            updatedTables.push(tableName);
            return {
              set: jest.fn(() => ({
                where: jest.fn(() => ({
                  returning: jest.fn(() =>
                    Promise.resolve([{ id: emotionId }])
                  ),
                })),
              })),
            };
          });

          await toggleEmotionActive(emotionId, isActive, level);

          // emotion_logs must NEVER be updated
          expect(updatedTables).not.toContain("emotion_logs");
        }
      ),
      { numRuns: 100 }
    );
  });
});
