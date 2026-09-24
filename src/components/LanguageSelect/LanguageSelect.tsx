import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { useLanguage } from '../../hooks/useLanguage';
import { loadFontSet } from '../../i18n/fonts';
import { LANGUAGES, LANGUAGE_ORDER, type LanguageId } from '../../i18n';
import { en } from '../../i18n/locales/en';
import './LanguageSelect.css';

type Props = {
  /** `popover`: the compact control in the header. `inline`: the row inside the menu. */
  variant?: 'popover' | 'inline';
};

export function LanguageSelect({ variant = 'popover' }: Props) {
  return variant === 'inline' ? <LanguageInline /> : <LanguagePopover />;
}

/** Real languages announce their own `lang`, so "Português" is read in Portuguese. */
const langAttr = (id: LanguageId) => (LANGUAGES[id].script === 'latin' ? LANGUAGES[id].htmlLang : undefined);

/**
 * The mode's own name in its own letters — like the modes themselves, the
 * English word, redrawn. Shown only once its face is ready.
 */
function ScriptSample({ id, ready }: { id: LanguageId; ready: boolean }) {
  const { script } = LANGUAGES[id];
  if (script === 'latin' || !ready) return null;
  return (
    <span className={`lang__sample lang__sample--${script}`} aria-hidden="true">
      {en.language.names[id]}
    </span>
  );
}

function LanguagePopover() {
  const { language, meta, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [samples, setSamples] = useState({ elvish: false, dwarvish: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const panelId = useId();

  // Built once, then played and reversed: 0.22 s in, a little quicker out.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion();
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'power2.out' } })
        .fromTo(
          panel,
          { autoAlpha: 0, y: reduced ? 0 : -6, scale: reduced ? 1 : 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: reduced ? 0.12 : 0.22, transformOrigin: '100% 0%' },
        )
        .fromTo(
          '.lang__option',
          { opacity: 0, y: reduced ? 0 : -4 },
          { opacity: 1, y: 0, duration: 0.14, stagger: 0.02 },
          reduced ? 0 : 0.03,
        );
    }, panel);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timeline = tl.current;
    if (!timeline) return;
    if (open) timeline.timeScale(1).play();
    else timeline.timeScale(1.25).reverse();
  }, [open]);

  // Opening the list is a good moment to fetch both script faces: the samples
  // appear, and choosing a script afterwards is instant.
  useEffect(() => {
    if (!open || (samples.elvish && samples.dwarvish)) return;
    let live = true;
    loadFontSet('elvish').then((ok) => live && ok && setSamples((s) => ({ ...s, elvish: true })));
    loadFontSet('dwarvish').then((ok) => live && ok && setSamples((s) => ({ ...s, dwarvish: true })));
    return () => {
      live = false;
    };
  }, [open, samples.elvish, samples.dwarvish]);

  // A press anywhere else closes the list.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const options = () => [...(panelRef.current?.querySelectorAll<HTMLButtonElement>('.lang__option') ?? [])];

  const focusOption = (index: number) => {
    const list = options();
    if (!list.length) return;
    list[(index + list.length) % list.length].focus({ preventScroll: true });
  };

  const focusCurrent = () => focusOption(Math.max(0, LANGUAGE_ORDER.indexOf(language)));

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      // The panel is in the DOM already (only hidden), so it can take focus next frame.
      requestAnimationFrame(focusCurrent);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      close(true);
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent) => {
    const list = options();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusOption(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusOption(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusOption(0);
        break;
      case 'End':
        e.preventDefault();
        focusOption(list.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
    }
  };

  const choose = (id: LanguageId) => {
    setLanguage(id);
    close(true);
  };

  const currentName = t(`language.names.${language}`);

  return (
    <div
      className={`lang script-exempt ${open ? 'is-open' : ''}`}
      ref={rootRef}
      // Tabbing out of the control closes it.
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && next && !rootRef.current?.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="lang__trigger"
        aria-label={t('language.select', { name: currentName })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="lang__kicker t-label" aria-hidden="true">
          {t('language.label')}
        </span>
        <span className="lang__current t-label" aria-hidden="true">
          <span className="lang__code-roll">
            <span key={meta.code} className="lang__code-text">
              {meta.code}
            </span>
          </span>
          <span className="lang__caret" />
        </span>
      </button>

      <div id={panelId} ref={panelRef} className="lang__panel" onKeyDown={onPanelKeyDown}>
        <p className="lang__heading t-label" aria-hidden="true">
          {t('language.label')}
        </p>
        <ul className="lang__list">
          {LANGUAGE_ORDER.map((id) => {
            const option = LANGUAGES[id];
            const active = id === language;
            return (
              <li key={id}>
                <button
                  type="button"
                  className="lang__option"
                  aria-current={active ? 'true' : undefined}
                  lang={langAttr(id)}
                  onClick={() => choose(id)}
                >
                  <span className="lang__dot" aria-hidden="true" />
                  <span className="lang__label">
                    <span className="lang__name">{t(`language.names.${id}`)}</span>
                    {option.script !== 'latin' && (
                      <span className="lang__caption t-mono">{t(`language.scripts.${option.script}`)}</span>
                    )}
                  </span>
                  <ScriptSample id={id} ready={option.script !== 'latin' && samples[option.script]} />
                  <span className="lang__code t-mono" aria-hidden="true">
                    {option.code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="lang__note">{t('language.note')}</p>
      </div>
    </div>
  );
}

function LanguageInline() {
  const { language, setLanguage, t } = useLanguage();
  const labelId = useId();

  return (
    <div className="lang-inline script-exempt" role="group" aria-labelledby={labelId}>
      <p className="lang-inline__label t-label" id={labelId}>
        {t('language.label')}
      </p>
      <ul className="lang-inline__list">
        {LANGUAGE_ORDER.map((id) => {
          const option = LANGUAGES[id];
          const active = id === language;
          return (
            <li key={id}>
              <button
                type="button"
                className="lang-inline__option"
                aria-current={active ? 'true' : undefined}
                lang={langAttr(id)}
                onClick={() => setLanguage(id)}
              >
                <span className="lang-inline__code t-label" aria-hidden="true">
                  {option.code}
                </span>
                <span className="lang-inline__name">{t(`language.names.${id}`)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
