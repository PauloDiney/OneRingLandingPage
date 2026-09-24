import { Fragment, type ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { MessageKey } from './types';

type Props = {
  k: MessageKey;
  /** `{name}` placeholders filled with elements (an <em>, a link…). */
  values?: Record<string, ReactNode>;
};

function interpolate(text: string, values: Record<string, ReactNode>) {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={i}>{name && name in values ? values[name] : part}</Fragment>;
  });
}

/**
 * Translated text, always in its own span: the language transition dims these
 * spans only, so it can never fight an animation that owns the surrounding
 * element's opacity, transform or filter.
 *
 * The output never depends on the script mode — Elvish and Dwarvish are drawn
 * by CSS alone (styles/scripts.css). That matters: SplitText restores its
 * snapshot of an element's HTML, which is only safe while that HTML is stable.
 */
export function T({ k, values }: Props) {
  const { t } = useLanguage();
  const text = t(k);
  return (
    <span className="i18n" data-i18n>
      {values ? interpolate(text, values) : text}
    </span>
  );
}

/** For translated strings that come from a list (the Ring's verse) rather than a key. */
export function Text({ children }: { children: ReactNode }) {
  return (
    <span className="i18n" data-i18n>
      {children}
    </span>
  );
}
