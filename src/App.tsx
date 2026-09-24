import { useEffect } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { Navbar } from './components/Navbar/Navbar';
import { ScrollVideo } from './components/ScrollVideo/ScrollVideo';
import { Journey } from './components/Journey/Journey';
import { Regions } from './components/Regions/Regions';
import { Ring } from './components/Ring/Ring';
import { Specs } from './components/Specs/Specs';
import { Mordor } from './components/Mordor/Mordor';
import { Footer } from './components/Footer/Footer';
import { ScrollIndicator } from './components/ScrollIndicator/ScrollIndicator';
import { Cursor } from './components/Cursor/Cursor';
import { T } from './i18n';

/*
 * Order matters here. Effects run in tree order, so sections create their
 * ScrollTriggers top to bottom — each pin exists before anything below it is
 * measured — and the indicator, which reads every section, comes last.
 */
export default function App() {
  // Web fonts change line lengths, which changes heights, which moves every
  // trigger. Measure again once they have actually arrived.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <a className="skip-link script-exempt" href="#journey">
        <T k="skip" />
      </a>

      <Navbar />

      <main id="top">
        <ScrollVideo />
        <Journey />
        <Regions />
        <Ring />
        <Specs />
        <Mordor />
      </main>

      <Footer />

      <ScrollIndicator />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
