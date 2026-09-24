import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

/*
 * The single place GSAP is configured. Everything imports from here, so the
 * plugins are registered exactly once whichever component mounts first.
 */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

ScrollTrigger.config({
  // Mobile browsers fire `resize` whenever the URL bar slides in or out.
  // Re-measuring on those makes sticky and pinned sections jump mid-scroll.
  ignoreMobileResize: true,
});

/** The house curve: a long, soft landing. Used for nearly every reveal. */
export const EASE_OUT = 'expo.out';

// Dev-only handle for auditing from the console, e.g. `ScrollTrigger.getAll()`.
// `import.meta.env.DEV` is statically false in production, so this is stripped.
if (import.meta.env.DEV) {
  Object.assign(window, { gsap, ScrollTrigger });
}

export { gsap, ScrollTrigger, SplitText };
