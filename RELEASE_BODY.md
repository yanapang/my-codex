# oh-my-codex v0.11.7

**15 dev-side commits in the release window, grouped into 3 reviewed lanes**

`0.11.7` is a focused patch release after `0.11.6`, centered on degraded-state auto-nudge recovery, team control-plane correctness, and release metadata consistency.

## Highlights

### Lane 1 — watcher / dispatch recovery
- Team dispatch resolves the shared runtime binary instead of a stale hook-local path
- Fallback watchers debounce Ralph continue-steers across processes
- Auto-nudge upgrades stale pane anchors to the live sibling Codex pane when possible
- Successful tmux fallback delivery now recovers requests back to `notified`
- Leader nudges no longer resurface completed teams or foreign-session activity

### Lane 2 — linked Ralph + team lifecycle hardening
- Linked Ralph stays alive for the full linked team run
- Prompt-mode launches skip the Ralph bridge correctly
- Leader mailbox sends are deduplicated across retry / notified paths
- Missing-team cleanup now finalizes linked Ralph cleanly

### Lane 3 — config / prompt / metadata consistency
- Default generated status lines now include `weekly-limit`
- Exact `gpt-5.4-mini` worker/subagent launches get a narrower prompt seam
- Child-agent guidance now prefers inheriting the current frontier default
- Node + Cargo release metadata are synchronized at `0.11.7`

## What’s Changed

### Fixes
- watcher / dispatch recovery: `#1002`, `#1004`, `#1020`, `#1021`
- leader nudge accuracy + mailbox-only control: `#1001`, `#1023`
- linked Ralph + team lifecycle follow-ups: `#1011`, `#1012`, `#1013`, `#1017`, `#1025`

### Changed
- generated defaults and prompt/model guidance: `#1009`, `#1016`, `#1018`
- release metadata consistency follow-up: `c4c5b75` (merged by `#1024`)

### Main vs dev sanity check
- `git rev-list --left-right --count main...dev` = `3 18`
- the `main`-only side is merge-only ancestry (`#995`, `#997`, `#1000`)
- no main-only patch content remained after cherry-pick elimination, so no separate main-only product changes need release-note coverage

## Verification

- `npm run build`
- `node --test dist/hooks/__tests__/notify-fallback-watcher.test.js dist/hooks/__tests__/notify-hook-auto-nudge.test.js` → `49/49` passing
- live tmux smoke: degraded-state fallback auto-nudge sent `yes, proceed [OMX_TMUX_INJECT]`
- live tmux smoke: back-to-back Ralph watcher runs stayed in `startup_cooldown` without repeat continue spam

## Remaining risk

- The live smoke used isolated disposable tmux sessions with a long-lived fake `codex` process, not a full interactive Codex conversation loop.
- The highest residual risk remains subtle control-plane state transitions under real interactive tmux sessions.

## Contributors

- [@Yeachan-Heo](https://github.com/Yeachan-Heo) (Bellman)

**Full Changelog**: [`v0.11.6...v0.11.7`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.11.6...v0.11.7)
