import { useLanguage } from '../hooks/useLanguage';
import { en } from './locales/en';
import { INSCRIPTION } from './tengwar';
import { T } from './T';

// The glyphs were generated from this exact line. Warn in development if the
// line is edited without regenerating them.
if (import.meta.env.DEV && en.film.finale.inscription !== INSCRIPTION.src) {
  console.warn(`[i18n] The Tengwar inscription was generated from "${INSCRIPTION.src}", but the line now reads "${en.film.finale.inscription}".`);
}

/**
 * "Ash nazg durbatulûk". In Elvish mode, drawn in real Tengwar as it is on the
 * Ring (hidden from assistive tech, which reads the Latin line instead).
 * Everywhere else — or if Tengwar Annatar cannot load — the usual text.
 */
export function Inscription() {
  const { t, inscriptionReady } = useLanguage();
  if (!inscriptionReady) return <T k="film.finale.inscription" />;
  return (
    <span className="i18n" data-i18n>
      <span className="inscription--tengwar" aria-hidden="true">
        {INSCRIPTION.glyphs}
      </span>
      <span className="sr-only">{t('film.finale.inscription')}</span>
    </span>
  );
}
