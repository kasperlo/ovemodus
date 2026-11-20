import { defineConfig } from 'vite';

export default defineConfig({
  // Relative stier, så builden virker under kasperlo.github.io/ovemodus/ uten å kjenne repo-navnet.
  base: './',
});
