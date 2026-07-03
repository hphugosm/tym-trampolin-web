// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://hphugosm.github.io',
  base: '/tym-trampolin-web/',
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin'),
  }), svelte()],
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    assets: '_assets'
  }
});