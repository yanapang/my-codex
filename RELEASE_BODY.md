# oh-my-codex v0.11.8

**Hotfix release for deep-interview nudge suppression and fresh-leader nudge dedupe hardening**

`0.11.8` follows `0.11.7` with a narrow fix set focused on keeping deep-interview sessions interruption-free and preventing duplicate fresh leader nudges.

## Highlights

- Deep-interview state now suppresses all notify-hook and fallback-watcher nudge families.
- Fallback watcher leader nudges remain stale-only, avoiding duplicate fresh-message nudges.
- Node and Cargo package metadata are synchronized at `0.11.8`.

## What’s Changed

### Fixes
- suppress leader nudges, worker-idle nudges, Ralph continue-steers, and auto-nudges whenever deep-interview state is active
- keep fallback watcher leader nudges gated on actual leader staleness
- add regression coverage proving the same fresh mailbox message does not re-trigger notify-hook leader nudges

### Changed
- release metadata updated from `0.11.7` to `0.11.8` across the TypeScript and Rust packages

## Verification

- `npm run build`
- `node --test --test-reporter=spec dist/hooks/__tests__/notify-hook-auto-nudge.test.js`
- `node --test --test-reporter=spec dist/hooks/__tests__/notify-hook-team-leader-nudge.test.js`
- `node --test --test-reporter=spec dist/hooks/__tests__/notify-fallback-watcher.test.js`

## Remaining risk

- This hotfix intentionally gates nudge entrypoints at the notify-hook and fallback-watcher callers; any future nudge caller should preserve the same deep-interview suppression contract.
- Verification is targeted to the nudge paths touched by this change rather than the entire repository test suite.

## Contributors

- [@Yeachan-Heo](https://github.com/Yeachan-Heo) (Bellman)

**Full Changelog**: [`v0.11.7...v0.11.8`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.11.7...v0.11.8)
