import { useSyncExternalStore } from 'react';
import type { Loader } from 'three';

/*
 * Download progress for Mapa3D.glb, in bytes. drei's useProgress counts
 * files, so with one 15 MB file it would sit at 0% until the very end; the
 * loader underneath useGLTF knows the bytes, so it is asked directly.
 */

/** Size of Mapa3D.glb, for servers that do not send Content-Length (e.g. when gzipping). */
const EXPECTED_BYTES = 15_764_892;

let fraction = 0;
const listeners = new Set<() => void>();

function report(loaded: number, total: number) {
  const next = Math.min(1, loaded / (total || EXPECTED_BYTES));
  if (next <= fraction) return;
  fraction = next;
  listeners.forEach((fn) => fn());
}

type Loadable = {
  load(url: string, onLoad: (data: unknown) => void, onProgress?: (e: ProgressEvent) => void, onError?: (e: unknown) => void): unknown;
};

/** Passed to useGLTF as `extendLoader`: reports byte progress, changes nothing else. */
export function trackProgress(loader: Loader) {
  const target = loader as unknown as Loadable;
  const load = target.load.bind(target);
  target.load = (url, onLoad, onProgress, onError) =>
    load(
      url,
      onLoad,
      (event) => {
        report(event.loaded, event.lengthComputable ? event.total : 0);
        onProgress?.(event);
      },
      onError,
    );
}

export function useDownloadProgress() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => fraction,
  );
}
