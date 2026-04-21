# oh-my-codex v0.14.2

## Summary

`0.14.2` is a patch release after `v0.14.1` focused on fast-follow operator reliability. It keeps ultrawork activation usable when `ulw` is typed through a Korean 2-set keyboard, aligns `omx question` answer injection with the shared tmux pane-send helper, fails closed when `omx question` cannot open a visible attached tmux renderer, prevents stale duplicate MCP siblings from lingering after post-duplicate traffic, preserves cleared deep-interview session state against legacy root fallback, clarifies that background `omx question` terminals must be awaited before continuing deep-interview, and ships the TypeScript/Biome baseline refresh that landed on `dev`.

## Added

- **Korean `ulw` keyboard drift handling** — prompts typed as `ㅕㅣㅈ` normalize to the existing `ulw` ultrawork shorthand before workflow activation.
- **Background-question guidance for deep-interview** — skill, template, and native-hook guidance now tell agents to wait for background `omx question` terminals to finish and read the JSON answer before scoring ambiguity or handing off.

## Changed

- **Question answer injection shares tmux submit semantics** — `src/question/renderer.ts` now delegates to `buildSendPaneArgvs`, preserving literal text delivery, shared newline sanitization, and isolated `C-m` submit calls.
- **Question rendering now requires a visible attached tmux pane** — outside attached tmux, `omx question` raises a clear renderer error instead of spawning a detached session that the operator cannot see.
- **Deep-interview routing intent is tighter** — cleanup/state-management mentions of “deep interview” no longer activate the workflow unless the prompt explicitly asks to run it.
- **Toolchain baseline refresh** — TypeScript is updated to `6.0.3`, Biome lockfile metadata is refreshed to `2.4.12`, and `tsconfig.json` pins Node ambient types for the TS 6 build path.

## Fixed

- **Duplicate MCP sibling leaks after traffic** — older same-parent stdio duplicates now self-exit after a configurable safe idle window even if they handled traffic after the duplicate appeared.
- **Session-scoped clear fallback leaks** — clearing a tracked mode under an active session now writes an inactive session tombstone when a legacy root fallback file exists, so status/read surfaces stay cleared.
- **Failed deep-interview question launches no longer leave pending obligations behind** — question-launch errors clear the outstanding enforcement marker instead of trapping the workflow in a stale pending state.
- **Release metadata drift** — Node/Cargo package metadata, lockfiles, changelog, release body, release notes, and release-readiness docs are synchronized to `0.14.2`.

## Verification

- `$code-review` over `v0.14.1..Yeachan-Heo/dev` — code-reviewer COMMENT and architect WATCH on follow-up boundary cleanup; no blocking findings accepted for the release cut.
- Local latest-scope review of `v0.14.1..Yeachan-Heo/dev` — no correctness or release-blocking regressions found in the question, state, MCP, or keyword-detector fast-follow changes.
- `npm run lint`
- `npm test`
- `cargo test -p omx-explore-harness -p omx-sparkshell`
- `npm pack --dry-run`

## Remaining risk

- This is still a local release-readiness pass, not a full GitHub Actions matrix rerun.
- Code-review WATCH items are documented but accepted for this patch cut: the cleared-session tombstone helper is duplicated in CLI/MCP state paths, detached question-renderer code remains as a retained legacy branch, MCP duplicate cleanup still relies on conservative process/timing heuristics, and the deep-interview contract text remains duplicated across shipped guidance surfaces.
- The highest-value post-release observation surface remains real tmux / reused-session operator behavior around `omx question`, prompt submission, state clear/read precedence, duplicate MCP sibling cleanup, and multilingual workflow activation.

## Contributors

Thanks to Yeachan-Heo, Bellman, pinion05, sappho192, and the OMX contributors who landed and reviewed the fixes in this patch train.

**Full Changelog**: [`v0.14.1...v0.14.2`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.14.1...v0.14.2)
