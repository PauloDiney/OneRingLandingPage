import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/media';

type Options = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** The tall section whose scroll range is the film's timeline. */
  triggerRef: RefObject<HTMLElement | null>;
  /** ScrollTrigger `end` for the film. Re-evaluated on every refresh. */
  end: () => string;
  /** Frame rate of the encoded file. Seeks are snapped to real frames. */
  fps?: number;
  /**
   * Share of the remaining distance covered per 60 Hz frame (0–1). Lower is
   * heavier and more cinematic; 1 follows the scrollbar exactly.
   */
  smoothing?: number;
  /** Called whenever the displayed frame changes. For direct DOM writes only. */
  onFrame?: (frame: number, totalFrames: number) => void;
};

const MS_PER_60HZ_FRAME = 1000 / 60;
/** Some mobile browsers occasionally never fire `seeked`; unblock anyway. */
const SEEK_WATCHDOG_MS = 250;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const onIdle = (fn: () => void) => {
  // Not in Safari before 18, whatever lib.dom says.
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1200);
  return () => window.clearTimeout(id);
};

/**
 * Turns a paused <video> into a timeline driven by scroll.
 *
 *   scroll ──► progress ──► targetTime = duration × progress
 *                                  │
 *   gsap.ticker ── currentTime = lerp(currentTime, targetTime, smoothing)
 *                                  │
 *                        one seek in flight, snapped to a frame
 *
 * Scroll never touches the video directly. Writing `currentTime` on every
 * scroll event queues seeks the decoder cannot honour and the picture
 * stutters; here the ticker performs at most one seek at a time and simply
 * skips frames while the decoder is busy, so fast scrolling degrades into a
 * slightly lower frame rate instead of a stall.
 *
 * Nothing touches React state: the page never re-renders while scrolling.
 */
export function useScrollVideo({
  videoRef,
  triggerRef,
  end,
  fps = 30,
  smoothing = 0.085,
  onFrame,
}: Options) {
  // Kept in refs so changing them never tears down the ScrollTrigger.
  const endRef = useRef(end);
  const onFrameRef = useRef(onFrame);

  useLayoutEffect(() => {
    endRef.current = end;
    onFrameRef.current = onFrame;
  });

  useLayoutEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    if (!video || !trigger) return;

    const frame = 1 / fps;
    const reduced = prefersReducedMotion();

    let duration = 0;
    let progress = 0;
    let currentTime = 0;
    let appliedTime = -1;
    let reportedFrame = -1;
    let seeking = false;
    let watchdog = 0;
    let cancelIdle: (() => void) | undefined;

    // --- scroll → target ------------------------------------------------------
    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: () => endRef.current(),
      onUpdate: (self) => {
        progress = self.progress;
      },
      onRefresh: (self) => {
        progress = self.progress;
      },
    });

    // --- video readiness ------------------------------------------------------
    const onMetadata = () => {
      if (duration || !Number.isFinite(video.duration) || video.duration <= 0) return;
      duration = video.duration;

      // Arriving mid-page (a reload, a restored scroll position): start on the
      // right frame rather than easing in from the first one.
      progress = st.progress;
      currentTime = progress * duration;

      // `preload="metadata"` keeps the first paint light. Once the page is idle,
      // let the browser buffer the rest so scrubbing never waits on the network.
      cancelIdle = onIdle(() => {
        video.preload = 'auto';
      });
    };

    const release = () => {
      seeking = false;
      window.clearTimeout(watchdog);
    };

    // Belt and braces: this video must never play on its own.
    let unlocking = false;
    const onPlay = () => {
      if (!unlocking) video.pause();
    };

    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('seeked', release);
    video.addEventListener('play', onPlay);

    // Metadata may already be there (cached file, StrictMode re-run).
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();

    // --- iOS: a <video> that has never played does not paint seeked frames.
    // One muted play/pause on the first gesture unlocks it. Not autoplay: it is
    // silent, lasts one frame, and the `play` guard above pauses it regardless.
    let unlocked = false;
    const settle = () => {
      unlocking = false;
      video.pause();
      // Playing moved the clock by a few milliseconds: force a fresh seek.
      appliedTime = -1;
    };
    const unlock = () => {
      if (unlocked || unlocking) return;
      unlocking = true;
      const attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt
          .then(() => {
            unlocked = true;
            settle();
          })
          .catch(() => {
            // No gesture credit yet — the next interaction retries.
            unlocking = false;
          });
      } else {
        unlocked = true;
        settle();
      }
    };
    const gestures = ['pointerdown', 'touchstart', 'keydown'] as const;
    gestures.forEach((type) => window.addEventListener(type, unlock, { passive: true }));

    // --- the single loop -----------------------------------------------------
    const tick = (_time: number, deltaMs: number) => {
      if (!duration) return;

      const targetTime = progress * duration;

      // Frame-rate independent lerp: same feel at 60 Hz and 120 Hz. Clamped so
      // returning to a background tab does not snap.
      const steps = Math.min(deltaMs / MS_PER_60HZ_FRAME, 4);
      const k = reduced ? 1 : 1 - Math.pow(1 - smoothing, steps);
      currentTime += (targetTime - currentTime) * k;
      if (Math.abs(targetTime - currentTime) < frame * 0.02) currentTime = targetTime;

      const frameIndex = Math.round(currentTime / frame);
      if (frameIndex !== reportedFrame) {
        reportedFrame = frameIndex;
        onFrameRef.current?.(frameIndex, Math.round(duration / frame));
      }

      if (seeking) return;

      // Seeking to exactly `duration` can stall some decoders: stop a frame short.
      const next = clamp(frameIndex * frame, 0, Math.max(duration - frame, 0));
      if (Math.abs(next - appliedTime) < frame * 0.5) return;

      appliedTime = next;
      seeking = true;
      watchdog = window.setTimeout(release, SEEK_WATCHDOG_MS);
      video.currentTime = next;
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      cancelIdle?.();
      window.clearTimeout(watchdog);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('seeked', release);
      video.removeEventListener('play', onPlay);
      gestures.forEach((type) => window.removeEventListener(type, unlock));
    };
  }, [videoRef, triggerRef, fps, smoothing]);
}
