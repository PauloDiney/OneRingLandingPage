import { Fragment, useEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { T } from '../i18n';
import { CHAPTERS, type ChapterId } from '../data/regionsPage';
import { Navbar } from '../components/Navbar/Navbar';
import { Cursor } from '../components/Cursor/Cursor';
import { RegionsHero } from '../components/RegionsPage/RegionsHero';
import { Bridge, RegionChapter } from '../components/RegionsPage/RegionChapter';
import { RegionsIndex } from '../components/RegionsPage/RegionsIndex';
import { RegionsClosing } from '../components/RegionsPage/RegionsClosing';
import '../components/RegionsPage/RegionsPage.css';

/**
 * Where one chapter's ground turns into the next through a gradient, rather
 * than through a reveal of the chapter's own (the Shire and Rohan open out of
 * the dark; see chapterMotion.ts).
 */
const BRIDGES: Partial<Record<ChapterId, { from: 'light' | 'dark'; into: 'light' | 'dark' }>> = {
  rivendell: { from: 'light', into: 'light' },
  moria: { from: 'light', into: 'dark' },
  gondor: { from: 'light', into: 'light' },
  mordor: { from: 'light', into: 'dark' },
};

/** Regions of Middle-earth: six chapters of one book, read by scrolling. */
export function RegionsPage() {
  // Web fonts change line lengths, and so heights: measure again once they
  // are in. Arriving with a chapter in the URL (/regions/#moria), re-seat it
  // on the settled layout.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
      if (target) {
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
        ScrollTrigger.update();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <a className="skip-link script-exempt" href={`#${CHAPTERS[0].id}`}>
        <T k="regionsPage.skip" />
      </a>

      <Navbar page="regions" />

      <main className="rg">
        <RegionsHero />
        {CHAPTERS.map((chapter, i) => {
          const bridge = BRIDGES[chapter.id];
          return (
            <Fragment key={chapter.id}>
              {bridge && <Bridge to={chapter.id} from={bridge.from} into={bridge.into} />}
              <RegionChapter chapter={chapter} eager={i === 0} />
            </Fragment>
          );
        })}
        <RegionsClosing />
      </main>

      <RegionsIndex />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
