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
