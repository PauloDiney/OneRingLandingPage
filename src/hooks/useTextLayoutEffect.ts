import { useLayoutEffect, useRef } from 'react';

/**
 * A layout effect for animations built on translated text — SplitText, above
 * all, which snapshots an element's HTML and restores that snapshot on revert.
 *
 * Pass the exact strings the effect splits — plus the script mode if it splits
 * into lines, since a new face breaks lines elsewhere. It re-runs only when
 * one of them changes. Elements it splits should carry `key={thatString}` so
 * React hands it a fresh node instead of patching text inside a split one.
 *
 * `rebuilt` is true on those re-runs, so reveals the reader has already
 * scrolled past can settle in place instead of playing again.
 */
export function useTextLayoutEffect(effect: (rebuilt: boolean) => void | (() => void), texts: readonly string[]) {
  const signature = texts.join('␞');
  const last = useRef(signature);

  useLayoutEffect(() => {
    const rebuilt = last.current !== signature;
    last.current = signature;
    return effect(rebuilt);
    // The signature stands in for the texts; the effect itself is read fresh.
  }, [signature]);
}
