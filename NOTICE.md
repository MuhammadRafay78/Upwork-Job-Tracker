# Attribution

This project is a fork of [Muatasim-Aswad/job-tracker](https://github.com/Muatasim-Aswad/job-tracker), merged in with full upstream history preserved. It is licensed MIT, Copyright (c) 2026 muatAsim — see [`LICENSE`](LICENSE).

## What's been added on top of the fork

- A built-in Upwork adapter (`apps/extension/src/adapters/builtin/upwork/`), registered alongside the upstream LinkedIn and Gmail adapters, following the same `Adapter` contract (`apps/extension/src/adapters/types.ts`).
- An `upwork` entry in the shared platform registry (`packages/shared/src/platforms/index.ts`) for posting-URL reconstruction.
- `www.upwork.com` added to the extension's host permissions (`apps/extension/src/adapters/builtin/hosts.json`).

The Upwork adapter is a scaffold: job-id/URL identification is derived from Upwork's known public URL scheme, but card discovery and detail scraping are deliberately conservative pending real captured HTML (see `apps/extension/src/adapters/builtin/upwork/fixtures/README.md`) — the same way the upstream LinkedIn adapter's selectors were built from and are tested against captured fixtures, not guessed.

## Everything else

The API, web dashboard, Kanban board, funnel model, LinkedIn/Gmail integrations, Docker/CLI tooling, and documentation are upstream's, unchanged except where noted above. Upstream's own `CHANGELOG.md`, `CONTRIBUTING.md`, and `docs/` describe that work in full.
