# greta
Greta – the English tutor

The app was migrated from a single-file vanilla-JS `index.html` to a React + TypeScript + Vite app. `app/` is the whole frontend now — there's no legacy version left.

## App

```
cd app
npm install
npm run dev            # local dev server
npm run lint            # oxlint
npm run format:check    # prettier
npm run build           # tsc -b && vite build
npm test                # playwright, against the built app
```

React + TypeScript + Vite, with [Base UI](https://base-ui.com/) for unstyled accessible components. All state lives in a single `useAppState()` hook (`app/src/state/useAppState.ts`), passed down as props — no Context or Redux. Screens are components in `app/src/screens/`, switched by a plain if/else chain in `App.tsx` keyed on the current screen. Pure data and logic with no dependency on runtime state (icons, i18n strings, avatar/list constants, paste-parsing, shuffling, etc.) live in `app/src/data/` and `app/src/lib/`.

Sign-in is real — a magic-link email through Supabase, the same project's public auth endpoints the app always used (`app/src/lib/auth.ts`) — but nothing re-syncs a signed-in user's lists to the server yet. Every screen still reads/writes local state only, exactly as a guest would; wiring up server sync for lists is separate follow-up work.

The app tracks the visual viewport (`app/src/lib/viewportHeight.ts`) so the on-screen keyboard shrinks `#frame` to fit above it instead of covering it, and corrects mobile browsers' own "scroll the focused input into view" behavior where it fights with that shrink — without this, content above a focused input (like the coin pouch during the write-5x remediation) can end up scrolled out of view exactly when it matters.

## Tests

End-to-end tests (Playwright) drive the real UI against the built app (`app/tests/`, run via `npm test` from `app/`).

## Deployment

`.github/workflows/deploy.yml` publishes `app/`'s build output to the `gh-pages` branch:

- pushes to `main` build the app (`npm ci && npm run build` in `app/`) and deploy it to the site root
- every pull request that touches `app/**` gets its own preview build at `pr-preview/pr-<number>/`, deployed on open/update and removed on close (via [`rossjrw/pr-preview-action`](https://github.com/rossjrw/pr-preview-action))

The build's asset paths are relative (`base: './'` in `app/vite.config.ts`), so the exact same `app/dist` output works unmodified whether it's deployed at the site root or nested under a PR's own `pr-preview/pr-<n>/` subpath — no per-deployment rebuild needed.

`.github/workflows/app-ci.yml` lints, format-checks, builds, and runs the Playwright tests on every PR that touches `app/**`, as a quality gate independent of deployment.

**One-time repo settings this workflow needs** (Settings → …):
- **Pages → Build and deployment → Source**: "Deploy from a branch", branch `gh-pages` / `(root)`.
- **Actions → General → Workflow permissions**: "Read and write permissions" — the workflow's own `contents: write` permission is capped by whatever this is set to, so it must allow write for the deploy step to push.

## Backend

`supabase/functions/greta/` is a Supabase Edge Function backing account sync and word-list translation — see `SETUP.md` for deploying it. It's independent of the frontend rewrite above.
