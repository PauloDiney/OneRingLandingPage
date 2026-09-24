export type FontSet = 'elvish' | 'dwarvish' | 'inscription';
export type FontStatus = 'idle' | 'loading' | 'loaded' | 'failed';

/** Must match the @font-face rules in styles/scripts.css. */
const FAMILIES: Record<FontSet, string[]> = {
  elvish: ['Elvish Display', 'Elvish Sans', 'Elvish Label', 'Elvish Mono'],
  dwarvish: ['Runes Display', 'Runes Sans', 'Runes Mono'],
  inscription: ['Tengwar Annatar'],
};

/** The script faces are limited to letters (unicode-range): ask for letters, or no face matches. */
const SAMPLE = 'Aa';
const TIMEOUT_MS = 1500;
const pending = new Map<FontSet, Promise<boolean>>();

function loadAll(set: FontSet, fonts: FontFaceSet) {
  return Promise.all(
    FAMILIES[set].map((family) =>
      fonts
        .load(`1em '${family}'`, SAMPLE)
        .then((faces) => faces.length > 0 && faces.every((face) => face.status === 'loaded')),
    ),
  )
    .then((results) => results.every(Boolean))
    .catch(() => false);
}

/**
 * Fetches a set of faces before they are needed, so switching modes never
 * shows a half-loaded script. Resolves to whether the set is usable. Never
 * rejects: a missing file or a slow network just means "not yet".
 */
export function loadFontSet(set: FontSet, onLateLoad?: () => void): Promise<boolean> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts || typeof fonts.load !== 'function') return Promise.resolve(true);

  let load = pending.get(set);
  if (!load) {
    load = loadAll(set, fonts);
    pending.set(set, load);
    // A failed attempt can be retried on the next switch.
    load.then((ok) => {
      if (!ok) pending.delete(set);
    });
  }

  let timedOut = false;
  const timeout = new Promise<boolean>((resolve) => {
    window.setTimeout(() => {
      timedOut = true;
      resolve(false);
    }, TIMEOUT_MS);
  });

  // If it lands after we stopped waiting, say so, so the script can appear.
  load.then((ok) => {
    if (ok && timedOut) onLateLoad?.();
  });

  return Promise.race([load, timeout]);
}
