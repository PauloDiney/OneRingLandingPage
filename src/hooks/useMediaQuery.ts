import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query. Only used for decisions that change what is
 * rendered (whether the custom cursor exists at all, for instance) — never for
 * anything that runs per frame.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
