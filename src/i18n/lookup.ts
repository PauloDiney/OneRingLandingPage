import type { Messages } from './types';

/** Resolves a dot-path to its string. Unknown paths fall back to the key itself, never to `undefined`. */
export function lookup(messages: Messages, key: string): string {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    node = node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined;
  }
  return typeof node === 'string' ? node : key;
}

/** `{name}` placeholders. */
export const format = (text: string, values?: Record<string, string>) =>
  values ? text.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match) : text;
