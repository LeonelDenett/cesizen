import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format français JJ/MM/AAAA.
 */
export function formatDateFR(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate a URL-friendly slug from a title.
 * Handles French accented characters, lowercases, replaces spaces/special chars with hyphens.
 */
export function generateSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s]+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

/**
 * Calculate date range for a given period (week, month, quarter, year).
 * Week starts on Monday (French convention).
 */
export function getDateRangeForPeriod(
  period: "week" | "month" | "quarter" | "year",
  referenceDate?: Date
): { startDate: Date; endDate: Date } {
  const ref = referenceDate ? new Date(referenceDate) : new Date();

  switch (period) {
    case "week": {
      const day = ref.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const startDate = new Date(ref);
      startDate.setDate(ref.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "month": {
      const startDate = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "quarter": {
      const quarter = Math.floor(ref.getMonth() / 3);
      const startMonth = quarter * 3;
      const startDate = new Date(ref.getFullYear(), startMonth, 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "year": {
      const startDate = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }
  }
}
