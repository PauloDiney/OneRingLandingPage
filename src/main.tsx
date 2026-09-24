import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted, Latin subset only: no request to a font CDN.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/geist-sans/latin-400.css';
import '@fontsource/geist-sans/latin-500.css';
import '@fontsource/geist-mono/latin-400.css';

import './styles/typography.css';
import './styles/globals.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
