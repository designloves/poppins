import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, not root-absolute ones: this same build output
  // gets deployed unmodified at multiple different subpaths (the site
  // root, and every open PR's own pr-preview/pr-<n>/ subpath), so it
  // can't assume any one of them at build time.
  base: './',
})
