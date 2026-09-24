import type { en } from './locales/en';

/**
 * What the reader picks. Elvish and Dwarvish are not BCP-47 languages (and
 * "el" is Greek), so the ids are plain words; `htmlLang` says what the page
 * actually contains.
 */
export type LanguageId = 'pt-BR' | 'en' | 'elvish' | 'dwarvish';

/** The language running text is written in. */
export type Prose = 'pt-BR' | 'en';

/** The writing system the page is drawn in: its own faces, or a letter-for-letter script face. */
export type Script = 'latin' | 'elvish' | 'dwarvish';

export type LanguageMeta = {
  id: LanguageId;
  /** Shown in the selector: PT-BR, EN, EL, DW. */
  code: string;
  /** Value of <html lang>. Script modes are English content. */
  htmlLang: string;
  prose: Prose;
  script: Script;
};

export type Messages = typeof en;

/** Every dot-path in the dictionary that ends in a string. */
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

export type Translate = (key: MessageKey, values?: Record<string, string>) => string;
