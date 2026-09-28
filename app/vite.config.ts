import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The short commit hash this build was made from, shown in Settings so
// it's possible to tell whether a device has actually picked up the
// latest deploy (vs. an old cached bundle) instead of a static, never-
// changing "v1" that says nothing. Falls back to 'dev' if git isn't
// available (e.g. a build from a source archive with no .git dir) —
// that's the only case worth guarding since every real build in this
// repo (local or CI) has full access to git.
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, not root-absolute ones: this same build output
  // gets deployed unmodified at multiple different subpaths (the site
  // root, and every open PR's own pr-preview/pr-<n>/ subpath), so it
  // can't assume any one of them at build time.
  base: './',
  define: {
    __COMMIT_HASH__: JSON.stringify(getCommitHash()),
  },
})
