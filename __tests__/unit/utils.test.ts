import { cn, formatDateFR, generateSlug, sanitize, sanitizeObject, getDateRangeForPeriod } from "@/lib/utils";

describe("lib/utils", () => {
  describe("cn", () => {
    it("merge les classes Tailwind", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("supprime les classes dupliquées", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("formatDateFR", () => {
    it("formate une date au format JJ/MM/AAAA", () => {
      const date = new Date(2024, 5, 15); // 15 juin 2024
      expect(formatDateFR(date)).toBe("15/06/2024");
    });

    it("formate une date avec jour/mois sur 1 chiffre", () => {
      const date = new Date(2024, 0, 5); // 5 janvier 2024
      expect(formatDateFR(date)).toBe("05/01/2024");
    });
  });

  describe("generateSlug", () => {
    it("convertit un titre en slug", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
    });

    it("supprime les accents", () => {
      expect(generateSlug("Émotions et Stress")).toBe("emotions-et-stress");
    });

    it("supprime les caractères spéciaux", () => {
      expect(generateSlug("C'est l'été !")).toBe("cest-lete");
    });

    it("trim les hyphens", () => {
      expect(generateSlug("  Hello  ")).toBe("hello");
    });
  });

  describe("sanitize", () => {
    it("supprime les balises HTML", () => {
      expect(sanitize("<script>alert('xss')</script>")).toBe("alert('xss')");
    });

    it("trim les espaces", () => {
      expect(sanitize("  hello  ")).toBe("hello");
    });
  });

  describe("sanitizeObject", () => {
    it("sanitize les strings d'un objet", () => {
      const input = { name: "<b>Test</b>", age: 25 };
      const result = sanitizeObject(input);
      expect(result.name).toBe("Test");
      expect(result.age).toBe(25);
    });
  });

  describe("getDateRangeForPeriod", () => {
    it("retourne la semaine en cours (lundi-dimanche)", () => {
      const result = getDateRangeForPeriod("week", new Date(2024, 5, 12)); // mercredi
      expect(result.startDate.getDay()).toBe(1); // lundi
      expect(result.endDate.getDay()).toBe(0); // dimanche
    });

    it("retourne le mois en cours", () => {
      const result = getDateRangeForPeriod("month", new Date(2024, 5, 15));
      expect(result.startDate.getDate()).toBe(1);
      expect(result.endDate.getMonth()).toBe(5);
    });

    it("retourne le trimestre en cours", () => {
      const result = getDateRangeForPeriod("quarter", new Date(2024, 5, 15));
      expect(result.startDate.getMonth()).toBe(3);
      expect(result.endDate.getMonth()).toBe(5);
    });

    it("retourne l'année en cours", () => {
      const result = getDateRangeForPeriod("year", new Date(2024, 5, 15));
      expect(result.startDate.getMonth()).toBe(0);
      expect(result.endDate.getMonth()).toBe(11);
    });

    it("utilise la date actuelle par défaut", () => {
      const result = getDateRangeForPeriod("week");
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });
});
