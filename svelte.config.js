import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',   // HTML output
      assets: 'build',  // static files (CSS/JS/images)
      fallback: null    // set to 'index.html' for SPA fallback
    }),
    prerender: {
      default: true     // ensure all routes are prerendered by default
    }
  }
};