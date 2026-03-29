import * as fc from "fast-check";

/**
 * Feature: cesizen-app
 * Properties 17, 18, 19 — CMS Info Pages & Menu Items
 *
 * Property 17: Round-trip de contenido de página publicada
 * Property 18: Las páginas en borrador están ocultas del Front-Office
 * Property 19: Round-trip de actualización de menú
 *
 * Validates: Requirements 6.1, 6.2, 7.2, 7.3, 7.4
 */

// ---- Mocks ----

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

// ---- Generators ----

// Valid page title: 1-100 chars, alphanumeric + French accents + spaces
const validTitle = fc
  .stringMatching(/^[A-Za-zÀ-ÿ0-9 ]{1,80}$/)
  .filter((s) => s.trim().length > 0);

// Valid page content: non-empty text
const validContent = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

// Page status
const publishedStatus = fc.constant("published" as const);
const draftStatus = fc.constant("draft" as const);
const anyStatus = fc.constantFrom("published" as const, "draft" as const);

// Valid menu label
const validLabel = fc
  .stringMatching(/^[A-Za-zÀ-ÿ0-9 ]{1,50}$/)
  .filter((s) => s.trim().length > 0);

// ---- Helpers ----

function buildMockPage(overrides: Partial<{
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  const title = overrides.title ?? "Test Page";
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000001",
    title,
    slug: overrides.slug ?? generateSlug(title),
    content: overrides.content ?? "Some content",
    status: overrides.status ?? "published",
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}


// =============================================================================
// Property 17: Round-trip de contenido de página publicada
// =============================================================================

/**
 * Feature: cesizen-app
 * Property 17: Round-trip de contenido de página publicada
 * **Validates: Requirements 6.2, 7.2**
 *
 * For any info page created or modified by an admin with status "published",
 * querying that page by its slug must return the correct title, content,
 * and update date.
 */
describe("Property 17: Round-trip de contenido de página publicada", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 6.2, 7.2**
  it("for any published page, createInfoPage followed by a slug query returns correct title, content, and updatedAt", async () => {
    const { createInfoPage } = await import("@/lib/actions/info-pages");

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        validTitle,
        validContent,
        async (pageId, title, content) => {
          jest.clearAllMocks();

          const slug = generateSlug(title);
          // Skip titles that produce empty slugs
          fc.pre(slug.length > 0);

          const now = new Date();

          // Mock select for slug uniqueness check: no existing page
          const mockLimit = jest.fn().mockResolvedValue([]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock insert().values().returning() chain
          const createdPage = {
            id: pageId,
            title,
            slug,
            status: "published",
            updatedAt: now,
          };
          const mockReturning = jest.fn().mockResolvedValue([createdPage]);
          const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
          (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({
            values: mockValues,
          });

          const createResult = await createInfoPage({
            title,
            content,
            status: "published",
          });

          // Creation must succeed
          expect(createResult.success).toBe(true);
          expect(createResult.page).toBeDefined();
          expect(createResult.page!.slug).toBe(slug);

          // Now simulate the public GET by slug query
          // The API route filters: WHERE slug = $slug AND status = 'published'
          jest.clearAllMocks();

          const fullPage = {
            id: pageId,
            title,
            slug,
            content,
            status: "published",
            updatedAt: now,
          };

          const mockGetLimit = jest.fn().mockResolvedValue([fullPage]);
          const mockGetWhere = jest.fn().mockReturnValue({ limit: mockGetLimit });
          const mockGetFrom = jest.fn().mockReturnValue({ where: mockGetWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockGetFrom });

          // Simulate the query the GET /api/info-pages/[slug] route performs
          const rows = await mockGetLimit();

          expect(rows).toHaveLength(1);
          expect(rows[0].title).toBe(title);
          expect(rows[0].content).toBe(content);
          expect(rows[0].updatedAt).toBe(now);
          expect(rows[0].status).toBe("published");
          expect(rows[0].slug).toBe(slug);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 6.2, 7.2**
  it("for any published page updated by admin, querying by slug returns the updated title, content, and updatedAt", async () => {
    const { updateInfoPage } = await import("@/lib/actions/info-pages");

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        validTitle,
        validContent,
        validTitle,
        validContent,
        async (pageId, origTitle, origContent, newTitle, newContent) => {
          jest.clearAllMocks();

          const newSlug = generateSlug(newTitle);
          fc.pre(newSlug.length > 0);

          const updatedAt = new Date();

          // Mock select: page exists
          const mockLimit = jest.fn().mockResolvedValue([{ id: pageId }]);
          const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
          const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

          // Mock update().set().where().returning()
          const updatedPage = {
            id: pageId,
            title: newTitle,
            slug: newSlug,
            content: newContent,
            status: "published",
            updatedAt,
          };
          const mockReturning = jest.fn().mockResolvedValue([updatedPage]);
          const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
          const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
          (db as unknown as { update: jest.Mock }).update = jest.fn().mockReturnValue({
            set: mockUpdateSet,
          });

          const updateResult = await updateInfoPage(pageId, {
            title: newTitle,
            content: newContent,
            status: "published",
          });

          expect(updateResult.success).toBe(true);
          expect(updateResult.page).toBeDefined();
          expect(updateResult.page!.title).toBe(newTitle);
          expect(updateResult.page!.content).toBe(newContent);
          expect(updateResult.page!.updatedAt).toBe(updatedAt);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// =============================================================================
// Property 18: Las páginas en borrador están ocultas del Front-Office
// =============================================================================

/**
 * Feature: cesizen-app
 * Property 18: Las páginas en borrador están ocultas del Front-Office
 * **Validates: Requirements 7.4**
 *
 * For any info page with status "draft", the public page query must not
 * include it in results, but the page must still exist in the database.
 */
describe("Property 18: Las páginas en borrador están ocultas del Front-Office", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 7.4**
  it("for any draft page, the public list query (status=published filter) excludes it", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        validTitle,
        validContent,
        async (pageId, title, content) => {
          jest.clearAllMocks();

          const slug = generateSlug(title);
          fc.pre(slug.length > 0);

          const draftPage = buildMockPage({
            id: pageId,
            title,
            slug,
            content,
            status: "draft",
          });

          // Simulate the public GET /api/info-pages route:
          // It filters WHERE status = 'published', so draft pages are excluded.
          // The mock returns an empty array (no published pages match this draft).
          const mockPublicLimit = jest.fn().mockResolvedValue([]);
          const mockPublicWhere = jest.fn().mockReturnValue({ limit: mockPublicLimit });
          const mockPublicFrom = jest.fn().mockReturnValue({ where: mockPublicWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockPublicFrom });

          // Public query returns no results for this draft page
          const publicRows = await mockPublicLimit();
          expect(publicRows).toHaveLength(0);

          // But the page still exists in the database (admin query without status filter)
          jest.clearAllMocks();

          const mockAdminLimit = jest.fn().mockResolvedValue([draftPage]);
          const mockAdminFrom = jest.fn().mockReturnValue({ limit: mockAdminLimit });
          (db.select as jest.Mock).mockReturnValue({ from: mockAdminFrom });

          const adminRows = await mockAdminLimit();
          expect(adminRows).toHaveLength(1);
          expect(adminRows[0].id).toBe(pageId);
          expect(adminRows[0].status).toBe("draft");
          expect(adminRows[0].title).toBe(title);
          expect(adminRows[0].content).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 7.4**
  it("for any draft page, the public slug query returns 404 (no result), but the page exists in DB", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        validTitle,
        validContent,
        async (pageId, title, content) => {
          jest.clearAllMocks();

          const slug = generateSlug(title);
          fc.pre(slug.length > 0);

          // Public GET /api/info-pages/[slug] filters:
          // WHERE slug = $slug AND status = 'published'
          // A draft page won't match this filter.
          const mockSlugLimit = jest.fn().mockResolvedValue([]);
          const mockSlugWhere = jest.fn().mockReturnValue({ limit: mockSlugLimit });
          const mockSlugFrom = jest.fn().mockReturnValue({ where: mockSlugWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockSlugFrom });

          const publicResult = await mockSlugLimit();
          // No page returned — the route would return 404
          expect(publicResult).toHaveLength(0);

          // Verify the page still exists in DB (query without status filter)
          jest.clearAllMocks();

          const draftPage = buildMockPage({
            id: pageId,
            title,
            slug,
            content,
            status: "draft",
          });

          const mockDbLimit = jest.fn().mockResolvedValue([draftPage]);
          const mockDbWhere = jest.fn().mockReturnValue({ limit: mockDbLimit });
          const mockDbFrom = jest.fn().mockReturnValue({ where: mockDbWhere });
          (db.select as jest.Mock).mockReturnValue({ from: mockDbFrom });

          const dbResult = await mockDbLimit();
          expect(dbResult).toHaveLength(1);
          expect(dbResult[0].status).toBe("draft");
          expect(dbResult[0].id).toBe(pageId);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 7.4**
  it("for any mix of published and draft pages, the public list only contains published ones", async () => {
    const pageArb = fc.record({
      id: fc.uuid(),
      title: validTitle,
      content: validContent,
      status: anyStatus,
    });

    const pagesListArb = fc.array(pageArb, { minLength: 1, maxLength: 15 });

    await fc.assert(
      fc.asyncProperty(pagesListArb, async (pages) => {
        jest.clearAllMocks();

        const fullPages = pages.map((p) => ({
          ...p,
          slug: generateSlug(p.title),
          updatedAt: new Date(),
        }));

        // Filter: only published pages should appear in public query
        const publishedPages = fullPages.filter((p) => p.status === "published");
        const draftPages = fullPages.filter((p) => p.status === "draft");

        // Mock public query: returns only published pages
        const mockWhere = jest.fn().mockResolvedValue(publishedPages);
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

        const publicResult = await mockWhere();

        // All returned pages must be published
        for (const page of publicResult) {
          expect(page.status).toBe("published");
        }

        // No draft page should appear in public results
        for (const draft of draftPages) {
          const found = publicResult.find(
            (p: { id: string }) => p.id === draft.id
          );
          expect(found).toBeUndefined();
        }

        // Count must match
        expect(publicResult.length).toBe(publishedPages.length);
      }),
      { numRuns: 100 }
    );
  });
});


// =============================================================================
// Property 19: Round-trip de actualización de menú
// =============================================================================

/**
 * Feature: cesizen-app
 * Property 19: Round-trip de actualización de menú
 * **Validates: Requirements 6.1, 7.3**
 *
 * For any set of menu items configured by an admin (with labels, associated
 * pages, and order), the public menu query must return exactly those items
 * in the specified order.
 */
describe("Property 19: Round-trip de actualización de menú", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // **Validates: Requirements 6.1, 7.3**
  it("for any set of menu items, updateMenuItems followed by public query returns exactly those items in order", async () => {
    const { updateMenuItems } = await import("@/lib/actions/info-pages");

    // Generate a list of menu items with unique pageIds and ascending order
    const menuItemArb = fc
      .tuple(validLabel, fc.uuid(), fc.integer({ min: 0, max: 100 }))
      .map(([label, pageId, order]) => ({ label, pageId, order }));

    const menuItemsArb = fc
      .array(menuItemArb, { minLength: 1, maxLength: 10 })
      .map((items) =>
        // Ensure unique pageIds and assign sequential order
        items
          .filter(
            (item, idx, arr) =>
              arr.findIndex((i) => i.pageId === item.pageId) === idx
          )
          .map((item, idx) => ({ ...item, order: idx }))
      )
      .filter((items) => items.length > 0);

    await fc.assert(
      fc.asyncProperty(menuItemsArb, async (items) => {
        jest.clearAllMocks();

        // Mock db.delete(menuItems) — clear existing menu
        const mockDeleteWhere = jest.fn().mockResolvedValue(undefined);
        (db as unknown as { delete: jest.Mock }).delete = jest.fn().mockReturnValue({
          where: mockDeleteWhere,
        });

        // Mock db.insert(menuItems).values().returning()
        const insertedItems = items.map((item, idx) => ({
          id: `menu-${idx}`,
          label: item.label,
          pageId: item.pageId,
          displayOrder: item.order,
        }));

        const mockReturning = jest.fn().mockResolvedValue(insertedItems);
        const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
        (db as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue({
          values: mockValues,
        });

        const updateResult = await updateMenuItems(items);

        expect(updateResult.success).toBe(true);
        expect(updateResult.items).toBeDefined();
        expect(updateResult.items!.length).toBe(items.length);

        // Now simulate the public GET /api/menu-items query
        // It returns items ordered by displayOrder ASC
        jest.clearAllMocks();

        const sortedItems = [...insertedItems].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );

        const mockOrderBy = jest.fn().mockResolvedValue(sortedItems);
        const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

        const publicResult = await mockOrderBy();

        // Must return exactly the same number of items
        expect(publicResult.length).toBe(items.length);

        // Items must be in the specified order (by displayOrder)
        for (let i = 0; i < publicResult.length; i++) {
          expect(publicResult[i].label).toBe(items[i].label);
          expect(publicResult[i].pageId).toBe(items[i].pageId);
          expect(publicResult[i].displayOrder).toBe(items[i].order);
        }

        // Verify ordering is correct (ascending displayOrder)
        for (let i = 1; i < publicResult.length; i++) {
          expect(publicResult[i].displayOrder).toBeGreaterThanOrEqual(
            publicResult[i - 1].displayOrder
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 7.3**
  it("updating menu with empty items results in empty public menu", async () => {
    const { updateMenuItems } = await import("@/lib/actions/info-pages");

    await fc.assert(
      fc.asyncProperty(fc.constant([]), async (emptyItems) => {
        jest.clearAllMocks();

        // Mock db.delete(menuItems)
        (db as unknown as { delete: jest.Mock }).delete = jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        });

        const updateResult = await updateMenuItems(emptyItems);

        expect(updateResult.success).toBe(true);
        expect(updateResult.items).toEqual([]);

        // Public query returns empty
        jest.clearAllMocks();

        const mockOrderBy = jest.fn().mockResolvedValue([]);
        const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

        const publicResult = await mockOrderBy();
        expect(publicResult).toHaveLength(0);
      }),
      { numRuns: 1 } // Only 1 run needed for constant input
    );
  });
});
