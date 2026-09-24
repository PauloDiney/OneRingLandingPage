import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Same faces and system as the home page (see main.tsx).
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/geist-sans/latin-400.css';
import '@fontsource/geist-sans/latin-500.css';
import '@fontsource/geist-mono/latin-400.css';

import './styles/typography.css';
import './styles/globals.css';
import './styles/scripts.css';

import { LanguageProvider } from './i18n';
import { MapPage } from './pages/MapPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider page="map">
      <MapPage />
    </LanguageProvider>
  </StrictMode>,
);
