import { generateSlug } from '@/lib/utils';

describe('generateSlug', () => {
  it('should lowercase and replace spaces with hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should strip French accented characters', () => {
    expect(generateSlug('Gestion du Stress')).toBe('gestion-du-stress');
    expect(generateSlug('Prévention Santé Mentale')).toBe('prevention-sante-mentale');
    expect(generateSlug('À propos de léquipe')).toBe('a-propos-de-lequipe');
    expect(generateSlug('Éducation thérapeutique')).toBe('education-therapeutique');
  });

  it('should handle special characters', () => {
    expect(generateSlug('Santé & Bien-être')).toBe('sante-bien-etre');
    expect(generateSlug('FAQ: Questions fréquentes')).toBe('faq-questions-frequentes');
  });

  it('should collapse multiple hyphens', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
    expect(generateSlug('Hello---World')).toBe('hello-world');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug(' Hello World ')).toBe('hello-world');
    expect(generateSlug('-Hello-')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('');
  });

  it('should handle French phrases with mixed accents', () => {
    expect(generateSlug('Gérer lAnxiété au Quotidien')).toBe('gerer-lanxiete-au-quotidien');
    expect(generateSlug('Les Émotions Négatives')).toBe('les-emotions-negatives');
  });
});
