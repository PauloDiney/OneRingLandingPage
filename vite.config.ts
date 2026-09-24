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
    rollupOptions: {
      // Two pages. The atlas (/map/) is its own entry, so three.js and the 3D
      // code never weigh on the home page; shared code is split out once.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        map: fileURLToPath(new URL('./map/index.html', import.meta.url)),
      },
      output: {
        // Stable vendor chunks: the 3D stack (atlas only) and the site's
        // runtime (both pages) are cached apart from the code that changes.
        manualChunks(id) {
          if (/node_modules[\\/](three|three-stdlib|three-mesh-bvh|@react-three)[\\/]/.test(id)) return 'three';
          if (/node_modules[\\/](react|react-dom|scheduler|gsap)[\\/]/.test(id)) return 'vendor';
        },
      },
    },
    // three.js is one large, cacheable library, loaded by the atlas alone.
    chunkSizeWarningLimit: 1100,
  },
});
