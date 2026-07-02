// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hphugosm.github.io',
  base: '/tym-trampolin-web/',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    assets: '_assets'
  }
});
