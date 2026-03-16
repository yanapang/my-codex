# oh-my-codex v0.10.1

**6 PRs in the release window**

`0.10.1` is the fast-follow stabilization release for `0.10.0`. The release window began with the `0.10.0` bump commit at `2026-03-15 17:22 UTC`; the four urgent hotfix PRs landed by `2026-03-16 03:18 UTC` (just under 10 hours later), and the final shipped follow-up merge (`#873`) landed at `2026-03-16 05:59 UTC`, bringing the shipped turnaround to about **12 hours 37 minutes** before this release-prep commit.

## Highlights

### Urgent hotfixes shipped first

- autoresearch now defaults to `--dangerously-bypass-approvals-and-sandbox` unless the caller already provided equivalent flags
- autoresearch worktree cleanliness now ignores `.omx/` runtime artifacts, preventing false dirty-worktree failures during reset/cleanup
- installed skills are deduplicated across project and user scopes, so shadowed duplicates no longer leak into composed instructions
- team worker readiness detection now accepts Codex `0.114.0` startup text and uses a safer ready-wait path

### Fast-follow autoresearch UX landed before the release cut

- `omx autoresearch` with no args on a TTY can now launch guided setup for research topic, evaluator command, keep policy, and mission slug
- `omx autoresearch init` now supports non-interactive mission scaffolding and safe tmux-backed supervisor launch
- non-interactive callers keep the previous failure-fast behavior when no mission path is provided

## What's Changed

### Urgent patches
- fix(autoresearch): default to bypass approvals and sandbox ([#856](https://github.com/Yeachan-Heo/oh-my-codex/pull/856), closes [#855](https://github.com/Yeachan-Heo/oh-my-codex/issues/855))
- fix(autoresearch): exclude `.omx/` runtime files from worktree clean check ([#858](https://github.com/Yeachan-Heo/oh-my-codex/pull/858), closes [#857](https://github.com/Yeachan-Heo/oh-my-codex/issues/857))
- fix(setup): deduplicate skills across project and user scope ([#864](https://github.com/Yeachan-Heo/oh-my-codex/pull/864), closes [#861](https://github.com/Yeachan-Heo/oh-my-codex/issues/861))
- fix(team): improve worker readiness detection for Codex 0.114.0 ([#868](https://github.com/Yeachan-Heo/oh-my-codex/pull/868), closes [#866](https://github.com/Yeachan-Heo/oh-my-codex/issues/866))

### Feature follow-up shipped in the same release sprint
- feat(cli): autoresearch guided setup + init subcommand ([#873](https://github.com/Yeachan-Heo/oh-my-codex/pull/873), closes [#863](https://github.com/Yeachan-Heo/oh-my-codex/issues/863))

### Docs follow-up
- docs: add Discord community server badge to the primary multilingual READMEs ([#869](https://github.com/Yeachan-Heo/oh-my-codex/pull/869))

## Patch-window timeline

- `2026-03-15 17:22 UTC` — `0.10.0` release bump commit (`fbb9f2d`)
- `2026-03-15 18:16 UTC` — PR [#856](https://github.com/Yeachan-Heo/oh-my-codex/pull/856) merged
- `2026-03-15 18:36 UTC` — PR [#858](https://github.com/Yeachan-Heo/oh-my-codex/pull/858) merged
- `2026-03-16 01:57 UTC` — PR [#864](https://github.com/Yeachan-Heo/oh-my-codex/pull/864) merged
- `2026-03-16 03:18 UTC` — PR [#868](https://github.com/Yeachan-Heo/oh-my-codex/pull/868) merged
- `2026-03-16 03:19 UTC` — PR [#869](https://github.com/Yeachan-Heo/oh-my-codex/pull/869) merged
- `2026-03-16 05:59 UTC` — PR [#873](https://github.com/Yeachan-Heo/oh-my-codex/pull/873) merged

## Local release verification checklist

Run before tagging / publishing:

- `node scripts/check-version-sync.mjs --tag v0.10.1`
- `npm run build`
- `npm run check:no-unused`
- `npm test`

**Full Changelog**: [`v0.10.0...v0.10.1`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.10.0...v0.10.1)
