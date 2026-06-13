import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://tdee.lab',
  trailingSlash: 'always',
  integrations: [tailwind()],
  compressHTML: true,
});
