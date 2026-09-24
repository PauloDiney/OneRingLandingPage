import type { LanguageId, LanguageMeta } from './types';

export const LANGUAGES: Record<LanguageId, LanguageMeta> = {
  'pt-BR': { id: 'pt-BR', code: 'PT-BR', htmlLang: 'pt-BR', prose: 'pt-BR', script: 'latin' },
  en: { id: 'en', code: 'EN', htmlLang: 'en', prose: 'en', script: 'latin' },
  elvish: { id: 'elvish', code: 'EL', htmlLang: 'en', prose: 'en', script: 'elvish' },
  dwarvish: { id: 'dwarvish', code: 'DW', htmlLang: 'en', prose: 'en', script: 'dwarvish' },
};

/** Selector order. */
export const LANGUAGE_ORDER: LanguageId[] = ['pt-BR', 'en', 'elvish', 'dwarvish'];

export const isLanguageId = (value: unknown): value is LanguageId =>
  typeof value === 'string' && Object.hasOwn(LANGUAGES, value);

const STORAGE_KEY = 'site-language';

/** Storage can be missing or throw (private modes, blocked cookies): the page carries on regardless. */
export function readStoredLanguage(): LanguageId | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLanguageId(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLanguage(id: LanguageId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Not persisted; the choice still applies for this visit.
  }
}

/**
 * First visit: the reader's most preferred language we have — Portuguese for
 * Portuguese-speaking browsers, English for everyone else.
 */
export function detectLanguage(): LanguageId {
  const preferred = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);
  for (const tag of preferred) {
    const lower = tag?.toLowerCase() ?? '';
    if (lower.startsWith('pt')) return 'pt-BR';
    if (lower.startsWith('en')) return 'en';
  }
  return 'en';
}
