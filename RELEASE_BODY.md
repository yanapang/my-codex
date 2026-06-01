# oh-my-codex 0.18.8

`0.18.8` is a patch release after `0.18.7` for the runtime reliability train that landed on `dev`. It focuses on HUD/session ownership under native session drift, Autopilot replay and context hardening, plugin hook/cache correctness, Team startup/disablement safety, and release/CI evidence improvements without intentional package-layout or CLI compatibility breaks.

## Highlights

- **HUD/session ownership is more durable** — HUD panes are scoped by leader/source pane, duplicate legacy/fallback panes are deduped after prompt revive, deleted-cwd doctor panes are avoided, escaped tmux separators are parsed correctly, and native session-id drift preserves HUD ownership.
- **Autopilot replay and context handling are safer** — completed terminal turns no longer reactivate Autopilot, context snapshots are seeded and hardened, task-seed provenance is clearer, and planning phases avoid editing under native session drift.
- **Plugin hook and mirror correctness is stricter** — stale plugin hook cache refresh is fixed, oversized Stop semantics and launcher JSON fallback behavior are preserved, setup mode survives update refresh, and mirror sync verifies plugin hook metadata.
- **Team/native-agent runtime behavior is clearer** — Team mode can be disabled, tmux worktree startup compatibility is fixed, native executor lanes remain leaf-only, and default native subagent routing guidance is corrected.
- **Release and CI evidence is tighter** — self-hosted Linux runner selection and GJC evidence lane optimization reduce avoidable CI churn while the release readiness document records full local/e2e/live gates.

## Fixes / compatibility

- Existing HUD, Autopilot, Team, plugin, and state files remain compatible; this release tightens ownership, cache, and replay behavior.
- README maintainer/contributor tables, Discord invite text, state operation help, and UltraQA harness guidance were updated.
- PR `#2685` is the maintainer CI wrapper for PR `#2682`; `#2682` is not counted separately in the final shipped compare inventory because the shipped merge commit is `#2685`.

## Merged PR inventory

#2686, #2685, #2684, #2677, #2676, #2675, #2672, #2657, #2652, #2671, #2664, #2660, #2670, #2667, #2666, #2661, #2665, #2656, #2654, #2655, #2651, #2643, #2650, #2649, #2648, #2642, #2636, #2646, #2640, #2596.

## Validation

Release readiness evidence is recorded in `docs/qa/release-readiness-0.18.8.md`.

Local gates completed before tagging include version sync, build, lint/no-unused, native-agent/plugin-bundle verification, full compiled tests, all discovered e2e/smoke/live gates available in the OMX session, release body generation, `git diff --check`, and `npm pack --dry-run`.

The GitHub release workflow remains the authoritative cross-platform native asset and npm publication gate after tag push.

## Contributors

Thanks to the contributors who landed the `v0.18.7...v0.18.8` delta:

- [@Yeachan-Heo](https://github.com/Yeachan-Heo)
- [@iqdoctor](https://github.com/iqdoctor)

**Full Changelog**: [`v0.18.7...v0.18.8`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.18.7...v0.18.8)
