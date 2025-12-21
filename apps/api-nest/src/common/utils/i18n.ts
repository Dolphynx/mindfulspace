// src/common/i18n/pick-translation.ts

export function pickTranslation<T extends { languageCode: string }>(
  translations: T[],
  lang: string,
  fallback: string = 'en',
): T | null {
  if (!translations?.length) return null;

  return (
    translations.find(t => t.languageCode === lang) ??
    translations.find(t => t.languageCode === fallback) ??
    null
  );
}
