# Working in this repo

## Branching & deployment

`main` is production. Once a change is merged, the next push to `main` rebuilds `app/` and publishes it live at `https://designloves.github.io/poppins/` (see `.github/workflows/deploy.yml`). Never commit or push directly to `main`.

- All development happens on a branch, opened as a pull request against `main`.
- A PR must pass CI (`.github/workflows/app-ci.yml`: lint, format check, build, Playwright tests) before it's considered ready to merge.
- Every PR gets its own live preview build at `https://designloves.github.io/poppins/pr-preview/pr-<number>/` (via `pr-preview-action`, deployed by the `preview` job in `deploy.yml`) — use it to test the actual change before merging, not just CI passing.
- Merging to `main` is a decision for a human to make, not something to do unprompted — open the PR, confirm it's green, and stop there unless explicitly told to merge.
