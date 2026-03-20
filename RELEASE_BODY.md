# oh-my-codex v0.11.1

**5 PRs in the release window**

`0.11.1` is a focused patch release following `0.11.0`. This release contains CI cleanup and a single regression fix for pane detection.

## Highlights

### Pane Detection Fix
- Auto-nudge fixtures aligned with canonical pane routing
- Hook nudges no longer land in the HUD pane

### CI Cleanup
- Tests isolated from live maintainer tmux/session state
- Packed installs no longer require ripgrep
- Release smoke tests focused on boot-safe packed installs

## What's Changed

### Fixes
- fix: keep full-suite auto-nudge fixtures aligned with canonical pane routing ([#981](https://github.com/Yeachan-Heo/oh-my-codex/pull/981))
- fix(test): isolate tmux/session discovery from live maintainer state ([#979](https://github.com/Yeachan-Heo/oh-my-codex/pull/979), closes [#963](https://github.com/Yeachan-Heo/oh-my-codex/issues/963))
- test(explore): avoid requiring host rg in strict allowlist test ([#978](https://github.com/Yeachan-Heo/oh-my-codex/pull/978), closes [#964](https://github.com/Yeachan-Heo/oh-my-codex/issues/964))
- fix(explore): keep packed installs alive without rg ([#978](https://github.com/Yeachan-Heo/oh-my-codex/pull/978))
- fix: keep release smoke focused on boot-safe packed installs ([#983](https://github.com/Yeachan-Heo/oh-my-codex/pull/983), closes [#982](https://github.com/Yeachan-Heo/oh-my-codex/issues/982))

## Referenced issues

[#963](https://github.com/Yeachan-Heo/oh-my-codex/issues/963), [#964](https://github.com/Yeachan-Heo/oh-my-codex/issues/964), [#982](https://github.com/Yeachan-Heo/oh-my-codex/issues/982)

## Contributors

- [@Yeachan-Heo](https://github.com/Yeachan-Heo) (Bellman)

## Local release verification checklist

Run before tagging / publishing:

- `node scripts/check-version-sync.mjs --tag v0.11.1`
- `npm run build`
- `npm run check:no-unused`
- `npm test`

**Full Changelog**: [`v0.11.0...v0.11.1`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.11.0...v0.11.1)
