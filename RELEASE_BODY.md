# oh-my-codex v0.12.5

**Team-runtime and multi-workflow state hardening, Windows reliability, tmux/shell stability, and HUD session anchoring**

`0.12.5` is a broad stability patch across 25 PRs and 74 files changed. It resolves a cluster of inter-related session-scoping, team startup/shutdown, Windows worker-path, and tmux cwd bugs that accumulated since `0.12.4`, adds current-task baseline branch guardrails for team workers, and tightens multi-workflow state management.

## Highlights

- **Multi-skill planning state preserved** — `ralplan`/`ralph` state no longer drops when a mixed-workflow prompt is re-routed mid-flight (#1471).
- **Team startup recovery** — workers that stall early during boot no longer hang the entire team launch sequence (#1444).
- **Windows reliability** — split-pane shutdown targeting, psmux launcher resolution, MCP orphan cleanup, and retired-config repair are all fixed (#1470, #1469, #1437, #1436).
- **tmux/shell cwd correctness** — detached tmux panes, worker shell launches, and Homebrew zsh paths now all honour the requested working directory (#1468, #1460, #1462).
- **HUD and session anchoring** — HUD state is now strictly scoped to the active OMX session; native session-id drift no longer hides transport failures (#1453, #1458).
- **Ralph stop-hook session isolation** — stop-hook leakage across sessions is eliminated (#1466).
- **Current-task baseline guardrails** — new per-task baseline branch tracking keeps team workers anchored to their correct starting commit (#1419).

## What's Changed

### Added
- Current-task baseline branch guardrails for team workers (PR [#1419](https://github.com/Yeachan-Heo/oh-my-codex/pull/1419))
- Approved multi-workflow overlap support in canonical state (PR [#1427](https://github.com/Yeachan-Heo/oh-my-codex/pull/1427))
- Windows `ps` fallback for notify hooks (PR [#1457](https://github.com/Yeachan-Heo/oh-my-codex/pull/1457))

### Fixed — Team startup / shutdown
- Stalled-worker startup no longer hangs team boot (PR [#1444](https://github.com/Yeachan-Heo/oh-my-codex/pull/1444))
- Cross-session stale root team Stop blocking eliminated (PR [#1451](https://github.com/Yeachan-Heo/oh-my-codex/pull/1451))
- Linux tmux startup handoff and shutdown-state persistence (PR [#1438](https://github.com/Yeachan-Heo/oh-my-codex/pull/1438))
- `session.json` ownership and fallback semantics tightened (PR [#1447](https://github.com/Yeachan-Heo/oh-my-codex/pull/1447))

### Fixed — Multi-skill / workflow state
- Planning state preserved in mixed workflow prompt routing (PR [#1471](https://github.com/Yeachan-Heo/oh-my-codex/pull/1471))
- Workflow handoff correctness and state-model documentation (PR [#1442](https://github.com/Yeachan-Heo/oh-my-codex/pull/1442))
- Flaky hook and HUD state scope alignment (PR [#1446](https://github.com/Yeachan-Heo/oh-my-codex/pull/1446))

### Fixed — Windows
- Split-pane shutdown stale leader-pane targeting (PR [#1470](https://github.com/Yeachan-Heo/oh-my-codex/pull/1470))
- Native psmux worker startup launcher resolution (PR [#1469](https://github.com/Yeachan-Heo/oh-my-codex/pull/1469))
- MCP orphan cleanup on parent shutdown (PR [#1437](https://github.com/Yeachan-Heo/oh-my-codex/pull/1437))
- Retired team MCP config repair on upgrade (PR [#1436](https://github.com/Yeachan-Heo/oh-my-codex/pull/1436))

### Fixed — tmux / macOS / shell
- Detached tmux launch cwd loss (PR [#1468](https://github.com/Yeachan-Heo/oh-my-codex/pull/1468))
- Worker cwd preserved on supported shell launches (PR [#1460](https://github.com/Yeachan-Heo/oh-my-codex/pull/1460))
- Homebrew zsh tmux pane shell normalization on macOS (PR [#1462](https://github.com/Yeachan-Heo/oh-my-codex/pull/1462))
- tmux startup PID resolution and copy-mode cleanup hardening (PR [#1459](https://github.com/Yeachan-Heo/oh-my-codex/pull/1459))

### Fixed — HUD / session anchoring
- HUD state anchored to active OMX session scope (PR [#1453](https://github.com/Yeachan-Heo/oh-my-codex/pull/1453))
- Native session-id drift no longer hides team transport failures (PR [#1458](https://github.com/Yeachan-Heo/oh-my-codex/pull/1458))

### Fixed — Explore harness
- `omx explore` now emits a clear actionable error when cargo is a rustup shim with no default toolchain, instead of surfacing the raw rustup message (`src/cli/explore.ts`)

### Fixed — Hooks / auth / notify
- Ralph stop-hook leakage across sessions eliminated (PR [#1466](https://github.com/Yeachan-Heo/oh-my-codex/pull/1466))
- Auto-nudge authorization leaks for read-only/planning flows (PR [#1434](https://github.com/Yeachan-Heo/oh-my-codex/pull/1434))
- Notify hooks stay tracking live teams through coarse state drift (PR [#1428](https://github.com/Yeachan-Heo/oh-my-codex/pull/1428))
- Launcher-backed MCP restart stalls now bounded (PR [#1408](https://github.com/Yeachan-Heo/oh-my-codex/pull/1408))

### Docs
- Removed stale `prompts/` invocation guidance (PR [#1417](https://github.com/Yeachan-Heo/oh-my-codex/pull/1417))

## Verification

- `npm run build` ✅
- `npm run lint` ✅
- `npm test` ✅
- `node --test dist/cli/__tests__/version-sync-contract.test.js` ✅
- `npm run smoke:packed-install` ✅

## Contributors

- [@Yeachan-Heo](https://github.com/Yeachan-Heo) (Bellman)
- [@HaD0Yun](https://github.com/HaD0Yun)

**Full Changelog**: [`v0.12.4...v0.12.5`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.12.4...v0.12.5)
