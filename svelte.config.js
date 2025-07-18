import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'  // enable SPA fallback for GitHub Pages
    }),
    paths: {
      base: dev ? '' : '/analyzeload'
    },
    prerender: {
      crawl: true,
      entries: ['*']  // prerender all pages found by crawling links
    }
  }
};

export default config;
