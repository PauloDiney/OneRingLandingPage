import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/media';
import { LANGUAGES, detectLanguage, readStoredLanguage, storeLanguage } from './languages';
import { loadFontSet, type FontSet, type FontStatus } from './fonts';
import { format, lookup } from './lookup';
import { en } from './locales/en';
import { ptBR } from './locales/pt-BR';
import type { LanguageId, LanguageMeta, Messages, Prose, Script, Translate } from './types';

const MESSAGES: Record<Prose, Messages> = { en, 'pt-BR': ptBR };

export type LanguageContextValue = {
  language: LanguageId;
  meta: LanguageMeta;
  /** The dictionary for running text. Script modes read the English one. */
  messages: Messages;
  t: Translate;
  /** The script actually drawn: the mode's own, or Latin if its font could not load. */
  script: Script;
  /** Elvish mode with Tengwar Annatar loaded: the Ring's inscription can be drawn in real Tengwar. */
  inscriptionReady: boolean;
  setLanguage: (id: LanguageId) => void;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Translated text currently on (or just beside) the screen. Only these take part in the transition. */
function visibleText(): HTMLElement[] {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  return [...document.querySelectorAll<HTMLElement>('[data-i18n]')].filter((el) => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.bottom > -vh * 0.1 && box.top < vh * 1.1 && box.right > 0 && box.left < vw;
  });
}

/**
 * Everything ScrollTrigger measures that new text could move: section
 * heights, and the width of the horizontal regions track.
 */
function layoutSignature() {
  const heights = [...document.querySelectorAll<HTMLElement>('main section[id], footer')].map((el) => el.offsetHeight);
  const widths = [...document.querySelectorAll<HTMLElement>('[data-layout-probe]')].map((el) => el.scrollWidth);
  return [document.documentElement.scrollHeight, ...heights, ...widths].join('|');
}

/*
 * Keeping the reader's place. New text above the viewport can be taller or
 * shorter than the old. Browsers with scroll anchoring compensate on their
 * own; for the rest, measure the section under the middle of the screen
 * (through its pin spacer when pinned) and scroll by however far it moved.
 * Where the browser already compensated, that distance is zero.
 */
type Anchor = { el: HTMLElement; top: number } | null;

function captureAnchor(): Anchor {
  const middle = window.innerHeight / 2;
  for (const section of document.querySelectorAll<HTMLElement>('main section[id], footer')) {
    const parent = section.parentElement;
    const el = parent?.classList.contains('pin-spacer') ? parent : section;
    const box = el.getBoundingClientRect();
    if (box.top <= middle && box.bottom >= middle) return { el, top: box.top };
  }
  return null;
}

function restoreAnchor(anchor: Anchor) {
  if (!anchor?.el.isConnected) return;
  const moved = anchor.el.getBoundingClientRect().top - anchor.top;
  if (Math.abs(moved) >= 1) window.scrollBy(0, moved);
}

type Pending = { faded: HTMLElement[]; layout: string; anchor: Anchor };

/**
 * The mode lives on <html> as a class, and every type token follows it
 * (styles/scripts.css). Set imperatively, and before React commits a switch:
 * sections re-split their text while committing, and must measure the new face.
 */
function applyScript(script: Script) {
  const root = document.documentElement;
  root.classList.toggle('script-elvish', script === 'elvish');
  root.classList.toggle('script-dwarvish', script === 'dwarvish');
}

const initialLanguage = (): LanguageId => {
  const id = readStoredLanguage() ?? detectLanguage();
  // Before the first paint, so a returning Elvish reader never sees a Latin frame.
  applyScript(LANGUAGES[id].script);
  return id;
};

type ProviderProps = {
  children: ReactNode;
  /** Which page's <title> and description to keep in the current language. */
  page?: 'home' | 'map' | 'regions';
};

export function LanguageProvider({ children, page = 'home' }: ProviderProps) {
  const [language, setLanguageState] = useState<LanguageId>(initialLanguage);
  const [fonts, setFonts] = useState<Record<FontSet, FontStatus>>({ elvish: 'idle', dwarvish: 'idle', inscription: 'idle' });

  const meta = LANGUAGES[language];
  const messages = MESSAGES[meta.prose];
  const script: Script = meta.script !== 'latin' && fonts[meta.script] === 'failed' ? 'latin' : meta.script;
  const inscriptionReady = script === 'elvish' && fonts.inscription === 'loaded';

  const t = useCallback<Translate>((key, values) => format(lookup(messages, key), values), [messages]);

  const current = useRef(language);
  const busy = useRef(false);
  const queued = useRef<LanguageId | null>(null);
  const pending = useRef<Pending | null>(null);

  /*
   * The dip is one tween at a time, owned here. Starting a new one kills the
   * last and puts back whatever it was holding that the new one will not
   * touch. (GSAP's 'auto' overwrite is not enough: with a stagger it acts as
   * each child starts, so two quick switches could half-kill each other and
   * leave words frozen mid-fade.)
   */
  const dip = useRef<{ tween: gsap.core.Animation; targets: HTMLElement[] } | null>(null);
  const startDip = useCallback((targets: HTMLElement[], make: () => gsap.core.Animation) => {
    const last = dip.current;
    if (last) {
      last.tween.kill();
      const kept = new Set(targets);
      const orphans = last.targets.filter((el) => !kept.has(el));
      if (orphans.length) gsap.set(orphans, { clearProps: 'opacity,filter' });
    }
    dip.current = { tween: make(), targets };
  }, []);

  /** Loads a mode's faces; resolves to whether the mode can be drawn in them. */
  const prepareFonts = useCallback((next: Script): Promise<boolean> => {
    if (next === 'latin') return Promise.resolve(true);

    const load = (set: FontSet) => {
      setFonts((prev) => (prev[set] === 'loaded' ? prev : { ...prev, [set]: 'loading' }));
      const lateLoad = () => {
        setFonts((prev) => ({ ...prev, [set]: 'loaded' }));
        // Arrived after we gave up waiting: switch the page over now, if the
        // reader is still in this mode.
        if (set === next && LANGUAGES[current.current].script === next) applyScript(next);
      };
      return loadFontSet(set, lateLoad).then((ok) => {
        setFonts((prev) => ({ ...prev, [set]: ok ? 'loaded' : 'failed' }));
        return ok;
      });
    };

    const faces = load(next);
    // The inscription's face is a nicety: waited for, but never a reason to fall back.
    const extra = next === 'elvish' ? load('inscription') : Promise.resolve(true);
    return Promise.all([faces, extra]).then(([ok]) => ok);
  }, []);

  /*
   * A switch is a short dip, never a hard cut (~0.1 s down, ~0.2 s back):
   *   visible text dims ──────┐
   *   next script font loads ─┴─► new face on <html> ─► commit ─► sections
   *                               re-split their text ─► text comes back
   * Scroll position, the film and every pin are left exactly where they are.
   */
  const run = useCallback(
    function run(next: LanguageId) {
      busy.current = true;
      const faded = prefersReducedMotion() ? [] : visibleText();
      const fadeOut = new Promise<void>((resolve) => {
        if (!faded.length) return resolve();
        // A hidden tab stops the animation clock: never let that stall a switch.
        const safety = window.setTimeout(resolve, 400);
        startDip(faded, () =>
          gsap.to(faded, {
            opacity: 0.2,
            duration: 0.1,
            ease: 'power1.in',
            onComplete: () => {
              window.clearTimeout(safety);
              resolve();
            },
          }),
        );
      });

      const nextScript = LANGUAGES[next].script;
      Promise.all([fadeOut, prepareFonts(nextScript)]).then(([, fontsOk]) => {
        if (next !== current.current) {
          // Measure the old layout first, then change face, then commit.
          pending.current = { faded, layout: layoutSignature(), anchor: captureAnchor() };
          applyScript(fontsOk ? nextScript : 'latin');
          setLanguageState(next);
          return;
        }
        // Switched back to where we started while fading: just come back.
        startDip(faded, () => gsap.to(faded, { opacity: 1, duration: 0.2, ease: 'power2.out', clearProps: 'opacity' }));
        busy.current = false;
        const later = queued.current;
        queued.current = null;
        if (later && later !== current.current) run(later);
      });
    },
    [prepareFonts, startDip],
  );

  const setLanguage = useCallback(
    (next: LanguageId) => {
      storeLanguage(next);
      // Mid-transition: remember only the latest choice.
      if (busy.current) {
        queued.current = next;
        return;
      }
      if (next !== current.current) run(next);
    },
    [run],
  );

  // A script mode restored from a previous visit needs its faces too.
  useEffect(() => {
    // Only on mount: later switches load their faces before committing.
    if (meta.script !== 'latin') prepareFonts(meta.script);
  }, []);

  // Keeps <html> honest when a face fails (or arrives late) outside a switch.
  useLayoutEffect(() => {
    applyScript(script);
  }, [script]);

  // Runs after every section has committed (and re-split) its new text.
  useLayoutEffect(() => {
    current.current = language;
    const root = document.documentElement;
    root.lang = meta.htmlLang;
    root.dataset.language = language;
    const pageMeta = page === 'map' ? messages.map.meta : page === 'regions' ? messages.regionsPage.meta : messages.meta;
    document.title = pageMeta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', pageMeta.description);

    const done = pending.current;
    if (!done) return;
    pending.current = null;

    // New text only moves triggers if it changed a measurement.
    if (layoutSignature() !== done.layout) {
      ScrollTrigger.refresh();
      restoreAnchor(done.anchor);
    }

    const entering = [...new Set([...visibleText(), ...done.faded.filter((el) => el.isConnected)])];
    if (entering.length && !prefersReducedMotion()) {
      startDip(entering, () =>
        gsap.fromTo(
          entering,
          { opacity: 0.2, filter: 'blur(1.5px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.2,
            ease: 'power2.out',
            stagger: { amount: 0.06 },
            clearProps: 'opacity,filter',
          },
        ),
      );
    }

    busy.current = false;
    const next = queued.current;
    queued.current = null;
    if (next && next !== language) run(next);
  }, [language, meta, messages, page, run, startDip]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, meta, messages, t, script, inscriptionReady, setLanguage }),
    [language, meta, messages, t, script, inscriptionReady, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
