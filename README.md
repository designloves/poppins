# greta
Greta – the English tutor

## Tests

End-to-end tests (Playwright) drive the real UI against `index.html` directly — no build or dev server needed.

```
npm install
npx playwright install chromium   # first run only, if not already installed
npm test
```
