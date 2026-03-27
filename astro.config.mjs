// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://harryskerritt.co.uk',
  integrations: [sitemap()],
  redirects: {
    '/download-success': '/downloads/download-success',
    '/download-failed': '/downloads/download-failed',
  }
});