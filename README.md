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

Known gap: the mobile keyboard-avoidance / dynamic-viewport-height system the original app had (`--app-height`, `resetOuterScroll`, html/body layout fixes) hasn't been ported yet — that's real, separate infrastructure work.

### Gamification: coins → dressing room

A multi-step plan: coins (earning, persistence, balance display — shipped) → a dressing room shell proving the equip/render loop end to end with one free accessory (shipped) → a real priced shop with several accessories across categories, using the same overlay technique → full-body avatars and clothing, if the earlier steps land well.

The dressing room (`app/src/screens/DressingRoom.tsx`) lets you equip/unequip accessories, which then render as an overlay (`app/src/components/AccessoryOverlay.tsx`) on top of the avatar image wherever it appears (Home header, Settings profile card). Accessories are defined in `app/src/data/accessories.ts`; there's currently one free starter item (a hand-drawn party hat, since no sourced accessory art exists yet) with no purchase flow — that's the next step, once real art is available.

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
