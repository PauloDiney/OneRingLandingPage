import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * The Ring section uses /public/images/one-ring.png when it exists and a
 * real-time render otherwise. Checking here, at build time, means the page
 * never requests a file that is not there (and never logs a 404 for it).
 * Restart the dev server after adding the image.
 */
const ringImage = fileURLToPath(new URL('./public/images/one-ring.png', import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    __RING_IMAGE__: JSON.stringify(existsSync(ringImage) ? '/images/one-ring.png' : null),
  },
  build: {
    // The scroll-scrubbed videos are already optimised by ffmpeg; never inline them.
    assetsInlineLimit: 4096,
  },
});
