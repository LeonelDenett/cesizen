import * as fc from "fast-check";
import { formatDateFR } from "@/lib/utils";
import * as fs from "fs";
import * as path from "path";

/**
 * Feature: cesizen-app
 * Property 35: HTML semántico en las páginas renderizadas
 * Validates: Requirements 15.1
 *
 * For any page rendered by the system, the resulting HTML must contain at least
 * the semantic tags `header`, `nav`, `main`, and `footer`.
 *
 * Since we cannot easily render React components in a Node test environment,
 * we verify that the layout source files contain the required semantic HTML tags.
 * Each layout group (public, auth, admin+root) must include header, nav, main, footer.
 */

/**
 * Feature: cesizen-app
 * Property 36: Formateo de fechas en formato francés
 * Validates: Requirements 16.3
 *
 * For any date displayed in the interface, the output format must match
 * the French pattern JJ/MM/AAAA (day/month/year with leading zeros).
 */

// --- Property 35: Semantic HTML in rendered pages ---

// Layout files that together compose the full page structure
const layoutFiles = [
  // Public layout group
  {
    name: "public",
    files: [
      "app/(public)/layout.tsx",
      "components/layout/Header.tsx",
      "components/layout/Footer.tsx",
      "components/layout/DynamicNav.tsx",
    ],
  },
  // Auth layout group
  {
    name: "auth",
    files: [
      "app/(auth)/layout.tsx",
      "components/layout/Header.tsx",
      "components/layout/Footer.tsx",
    ],
  },
];

const requiredSemanticTags = ["<header", "<nav", "<main", "<footer"];

describe("Property 35: HTML semántico en las páginas renderizadas", () => {
  // **Validates: Requirements 15.1**
  it("for any layout group, the combined source files contain all required semantic tags (header, nav, main, footer)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...layoutFiles),
        (layoutGroup) => {
          // Read and combine all source files for this layout group
          const combinedSource = layoutGroup.files
            .map((filePath) => {
              const fullPath = path.resolve(process.cwd(), filePath);
              return fs.readFileSync(fullPath, "utf-8");
            })
            .join("\n");

          // Every required semantic tag must be present
          for (const tag of requiredSemanticTags) {
            expect(combinedSource).toContain(tag);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 15.1**
  it("the root layout sets lang='fr' on the html element", () => {
    const rootLayoutPath = path.resolve(process.cwd(), "app/layout.tsx");
    const rootLayoutSource = fs.readFileSync(rootLayoutPath, "utf-8");

    expect(rootLayoutSource).toContain('lang="fr"');
  });

  // **Validates: Requirements 15.1**
  it("for any randomly selected layout file, it contributes at least one semantic tag", () => {
    const allLayoutFiles = [
      "app/(public)/layout.tsx",
      "app/(auth)/layout.tsx",
      "app/(admin)/admin/layout.tsx",
      "components/layout/Header.tsx",
      "components/layout/Footer.tsx",
      "components/layout/DynamicNav.tsx",
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...allLayoutFiles),
        (filePath) => {
          const fullPath = path.resolve(process.cwd(), filePath);
          const source = fs.readFileSync(fullPath, "utf-8");

          // Each layout file must contain at least one semantic tag
          const hasAtLeastOne = requiredSemanticTags.some((tag) =>
            source.includes(tag)
          );
          expect(hasAtLeastOne).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 36: French date formatting ---

// French date pattern: JJ/MM/AAAA (exactly 2-digit day / 2-digit month / 4-digit year)
const frenchDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// Generator: arbitrary Date objects within a realistic range for the application.
// CESIZen is a mental health tracker — dates are always modern (year 1000–9999).
// We cap at 9999-06-01 to avoid timezone offsets pushing into year 10000.
const arbDate = fc.date({
  min: new Date("1000-01-01T00:00:00.000Z"),
  max: new Date("9999-06-01T00:00:00.000Z"),
});

describe("Property 36: Formateo de fechas en formato francés", () => {
  // **Validates: Requirements 16.3**
  it("for any date, formatDateFR outputs a string matching JJ/MM/AAAA pattern", () => {
    fc.assert(
      fc.property(arbDate, (date) => {
        const result = formatDateFR(date);
        expect(result).toMatch(frenchDateRegex);
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 16.3**
  it("for any date, the day part has a leading zero when day < 10", () => {
    fc.assert(
      fc.property(arbDate, (date) => {
        const result = formatDateFR(date);
        const [day] = result.split("/");

        // Day must always be 2 characters
        expect(day.length).toBe(2);

        // The numeric value must match the actual day
        expect(parseInt(day, 10)).toBe(date.getDate());
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 16.3**
  it("for any date, the month part has a leading zero when month < 10", () => {
    fc.assert(
      fc.property(arbDate, (date) => {
        const result = formatDateFR(date);
        const [, month] = result.split("/");

        // Month must always be 2 characters
        expect(month.length).toBe(2);

        // The numeric value must match the actual month (1-indexed)
        expect(parseInt(month, 10)).toBe(date.getMonth() + 1);
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 16.3**
  it("for any date, the year part is the full 4-digit year", () => {
    fc.assert(
      fc.property(arbDate, (date) => {
        const result = formatDateFR(date);
        const [, , year] = result.split("/");

        expect(parseInt(year, 10)).toBe(date.getFullYear());
      }),
      { numRuns: 100 }
    );
  });

  // **Validates: Requirements 16.3**
  it("for any date, formatDateFR is a pure function (same input → same output)", () => {
    fc.assert(
      fc.property(arbDate, (date) => {
        const result1 = formatDateFR(date);
        const result2 = formatDateFR(date);
        expect(result1).toBe(result2);
      }),
      { numRuns: 100 }
    );
  });
});
