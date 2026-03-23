# Dev vs main review for release 0.11.7

## Scope

Compared `main...dev` at `dev=58f5265` / `main=fa86574`.

- Symmetric difference: `3` commits unique to `main`, `18` commits unique to `dev`
- `git rev-list --left-only --cherry-pick --no-merges main...dev` returned no commits, so the `main`-only side is merge-only ancestry (`#995`, `#997`, `#1000`) with no unique patch content requiring release-note mention.

## Lane 1 — hooks/scripts watcher + auto-nudge + dispatch/leader-nudge

### Commits / PRs

- `0aa41fe` — `#1002` Stop team dispatch from resolving the wrong runtime binary
- `35a077e` — `#1004` Fix multi-watcher Ralph continue steer spam
- `72c52e9` / `079391b` — `#1001` suppress stale leader nudges from completed or foreign-session teams
- `2faa7ab` — `#1020` restore tmux injection targeting and dispatch ID parity
- `eb4cd1c` — `#1021` recover successful fallback dispatches to notified state
- `1bc3dde` — `#1023` keep leader control mailbox-only and reduce false stalled nudges
- `4b84119` / `58f5265` — release refresh / merge `#1024`

### Files touched

- `src/runtime/bridge.ts`
- `src/scripts/notify-fallback-watcher.ts`
- `src/scripts/notify-hook/auto-nudge.ts`
- `src/scripts/notify-hook/team-dispatch.ts`
- `src/scripts/notify-hook/team-leader-nudge.ts`
- `src/team/runtime.ts`
- `src/team/state/dispatch.ts`
- targeted tests under `src/hooks/__tests__`, `src/runtime/__tests__`, `src/team/__tests__`

### User-facing changes

- Dispatch/hook code now resolves the runtime binary through the shared bridge instead of a stale script-local path, reducing silent runtime mismatch failures.
- Auto-nudge upgrades stale pane anchors to the live sibling Codex pane and uses the persisted TypeScript dispatch ID as the canonical runtime request ID.
- Fallback delivery can recover a previously failed dispatch into `notified` once tmux fallback delivery is confirmed, which removes misleading failed-state residue during worker startup.
- Detached fallback watchers now share on-disk cooldown state plus a cross-process lock, so Ralph continue steers are globally debounced instead of duplicating across watchers.
- Leader nudges ignore completed and foreign-session teams, and leader control remains mailbox/API only rather than direct pane injection.
- `4b84119` adds live tmux verification for degraded-state auto-nudge recovery and immediate Ralph anti-spam cooldown, then `58f5265` merges the refreshed release branch.

### Main risks

- Live tmux smoke exists for degraded auto-nudge and Ralph cooldown, but full interactive worker bootstrap with a real Codex conversation loop remained explicitly untested in these commits.
- This lane changes both notify-hook fallback behavior and dispatch-state reconciliation, so regressions would likely appear as startup delivery or false-stall symptoms rather than obvious build failures.

## Lane 2 — team runtime/state/mailbox/tmux-session + linked Ralph/team runtime

### Commits / PRs

- `22b084c` — `#1011` keep linked leader orchestration alive while team runs
- `f981102` — `#1012` resolve `ensureLinkedRalphModeState` import conflict
- `18ff653` — `#1013` skip Ralph bridge in prompt-mode to restore persistence gate
- `8b0b1d3` — `#1017` deduplicate repeated undelivered leader mailbox messages
- `61533ff` — `#1025` leader mailbox dedupe + linked Ralph missing-team finalization
- `1bc3dde` — `#1023` tmux-session stall-threshold follow-up relevant to runtime nudging

### Files touched

- `src/cli/team.ts`
- `src/team/linked-ralph-bridge.ts`
- `src/team/mcp-comm.ts`
- `src/team/runtime.ts`
- `src/team/state/mailbox.ts`
- `src/team/tmux-session.ts`
- targeted tests under `src/cli/__tests__` and `src/team/__tests__`

### User-facing changes

- Linked Ralph/team mode now keeps a dedicated bridge loop alive for the whole team run instead of dropping orchestration after launch.
- Prompt-mode launches now skip the linked Ralph bridge so the Ralph persistence gate works again.
- Leader mailbox writes are deduplicated both while a message is still undelivered and after hook-preferred notification already succeeded, reducing duplicate leader prompts.
- The linked Ralph bridge now exits cleanly if its paired team state disappears instead of lingering indefinitely.
- Stall detection in the team/tmux path now treats advancing worker turn counts as real progress, reducing false “stalled” leader nudges during active Codex thinking.

### Main risks

- The runtime/mailbox fixes are well covered by targeted tests, but the commits themselves still call out missing full interactive tmux/Codex end-to-end validation.
- Deduplication and missing-team finalization affect control-plane correctness, so regressions would surface as duplicate leader mail, hanging linked Ralph sessions, or shutdown/cleanup edge cases.

## Lane 3 — agents/config/prompts/release metadata consistency

### Commits / PRs

- `a3b7e4d` — `#1009` add `weekly-limit` to the default status line
- `d80cdfb` — `#1016` add exact-model prompt seam for `gpt-5.4-mini` subagents / team workers
- `58a20f4` — `#1018` keep child agents on the current frontier default
- `c4c5b75` / `58f5265` — `#1024` release metadata consistency merge

### Files touched

- `src/config/generator.ts`
- `src/agents/native-config.ts`
- `src/team/runtime.ts`
- `src/team/scaling.ts`
- `AGENTS.md`
- `templates/AGENTS.md`
- `Cargo.toml`
- `Cargo.lock`
- `docs/prompt-guidance-contract.md`

### User-facing changes

- Freshly generated default status lines now include `weekly-limit`.
- Exact `gpt-5.4-mini` workers/subagents receive an explicit prompt seam after final model resolution, keeping runtime/scaling behavior aligned with native subagent prompt composition.
- Root/template agent guidance now prefers inheriting the current frontier default instead of pinning stale explicit frontier model overrides for child agents.
- Release `0.11.7` metadata is synchronized across `package.json`, `Cargo.toml`, and `Cargo.lock`, which preserves the repo’s version-sync contract and unblocks the full Node 20 coverage lane for the release branch.

### Main risks

- The prompt/model guidance changes intentionally gate on exact `gpt-5.4-mini`; future model-family renames would need a deliberate follow-up rather than silently inheriting behavior.
- `c4c5b75` validated the version-sync contract and full TS coverage locally, but did not include a fresh GitHub Actions matrix rerun in the commit evidence.

## Evidence commands

- `git rev-list --left-right --count main...dev` → `3 18`
- `git log --left-right --cherry-pick --oneline main...dev`
- `git rev-list --left-only --cherry-pick --no-merges main...dev` → no output
- `git show --stat --no-renames <commit>` for `72c52e9`, `0aa41fe`, `35a077e`, `2faa7ab`, `eb4cd1c`, `1bc3dde`, `22b084c`, `f981102`, `18ff653`, `8b0b1d3`, `61533ff`, `a3b7e4d`, `d80cdfb`, `58a20f4`, `4b84119`, `c4c5b75`, `58f5265`
