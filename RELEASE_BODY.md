# oh-my-codex v0.10.2

**3 PRs in the release window**

`0.10.2` is a follow-up stabilization patch for `0.10.1`. The release window began with the `0.10.1` tag at `2026-03-16 06:57 UTC`; the three fix PRs landed by `2026-03-16 08:43 UTC` (just under 2 hours later), bringing the shipped turnaround to about **1 hour 46 minutes** before this release-prep commit.

## Highlights

### Targeted fixes

- autoresearch codex args are now normalized for sandbox bypass, preventing double-flag or missing-flag edge cases when composing launch arguments
- duplicate `[tui]` sections in `config.toml` are auto-repaired before Codex CLI launch, preventing TOML parse failures
- tmux launch policy on macOS now uses the correct policy to prevent session startup failures when the tmux server is not yet running

## What's Changed

### Fixes
- fix: normalize autoresearch codex args for sandbox bypass ([#875](https://github.com/Yeachan-Heo/oh-my-codex/pull/875))
- fix(config): auto-repair duplicate [tui] sections before Codex CLI launch ([#876](https://github.com/Yeachan-Heo/oh-my-codex/pull/876))
- fix(cli): use tmux launch policy on darwin ([#878](https://github.com/Yeachan-Heo/oh-my-codex/pull/878))

## Patch-window timeline

- `2026-03-16 06:57 UTC` — `0.10.1` release tag
- `2026-03-16 07:41 UTC` — PR [#876](https://github.com/Yeachan-Heo/oh-my-codex/pull/876) merged
- `2026-03-16 07:42 UTC` — PR [#875](https://github.com/Yeachan-Heo/oh-my-codex/pull/875) merged
- `2026-03-16 08:43 UTC` — PR [#878](https://github.com/Yeachan-Heo/oh-my-codex/pull/878) merged

## Local release verification checklist

Run before tagging / publishing:

- `node scripts/check-version-sync.mjs --tag v0.10.2`
- `npm run build`
- `npm run check:no-unused`
- `npm test`

**Full Changelog**: [`v0.10.1...v0.10.2`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.10.1...v0.10.2)
