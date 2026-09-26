# greta
Greta – the English tutor

## Tests

End-to-end tests (Playwright) drive the real UI against `index.html`. The app's code loads as ES modules (see below), which browsers block from `file://` origins, so Playwright starts a plain local server (`python3 -m http.server`) automatically — no other build or dev server needed.

```
npm install
npx playwright install chromium   # first run only, if not already installed
npm test
```

## Code layout

`index.html` holds the app's state, rendering, and screens. Pure data and logic with no dependency on runtime state — icons/mascot SVGs, i18n strings, avatar/list constants, and small pure helpers (paste-parsing, shuffling, etc.) — live in `js/` as plain ES modules, imported by `index.html`'s own `<script type="module">`.

## Deployment

`.github/workflows/deploy.yml` publishes the site to the `gh-pages` branch:

- pushes to `main` deploy to the site root
- every pull request gets its own preview at `pr-preview/pr-<number>/`, deployed on open/update and removed on close (via [`rossjrw/pr-preview-action`](https://github.com/rossjrw/pr-preview-action))

Right now the "build" step is a placeholder that just copies the already-deployable files (`index.html`, `js/`, `avatars/`) as-is — this is a pure infra change with no effect on what's served. Once the app moves to Vite, that step becomes `npm run build` and nothing else in the workflow needs to change.

**One-time repo settings this workflow needs** (Settings → …):
- **Pages → Build and deployment → Source**: "Deploy from a branch", branch `gh-pages` / `(root)`. The `gh-pages` branch doesn't exist until the workflow runs once, so set this after the first successful run on `main`.
- **Actions → General → Workflow permissions**: "Read and write permissions" — the workflow's own `contents: write` permission is capped by whatever this is set to, so it must allow write for the deploy step to push.

## New app (in progress)

`app/` is the in-progress React + TypeScript rewrite (Vite, [Base UI](https://base-ui.com/) for unstyled accessible components). It's not live anywhere yet — the root `index.html` is still what's deployed. `.github/workflows/app-ci.yml` lints, format-checks, builds, and runs its Playwright tests on every PR that touches `app/`, as a quality gate while it's being built out.

Screens ported so far: **Home**, **Practice setup**, **Quiz**, **Done** (results). Everything else they navigate to (lists, paste/edit, settings) is a placeholder proving the navigation is wired, not a real screen yet.

Known gap: the mobile keyboard-avoidance / dynamic-viewport-height system the legacy app has (`--app-height`, `resetOuterScroll`, the html/body layout fixes from earlier sessions) hasn't been ported here yet — that's real, separate infrastructure work, not part of any single screen.

```
cd app
npm install
npm run dev            # local dev server
npm run lint            # oxlint
npm run format:check    # prettier
npm run build           # tsc -b && vite build
npm test                # playwright, against the built app
```
