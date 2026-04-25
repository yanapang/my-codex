# Release Readiness Verdict - 0.15.0

Date: 2026-04-25
Target version: **0.15.0**
Candidate worktree branch: `worker-1/release-0.15.0-prep`
Candidate source branch: `dev` / `origin/dev`
Candidate source SHA before release-prep edits: `b5b6d13134eb86ecda2d9021cc83c0995f943ebe`
Release-prep commit SHA: `TBD after commit`
Reachable base tag from candidate source: `v0.14.3`
Compare link: [`v0.14.3...v0.15.0`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.14.3...v0.15.0)

## Base / range evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Worktree branch before release-prep branch | `git status --short --branch` reported `## HEAD (no branch)` at `b5b6d13134eb86ecda2d9021cc83c0995f943ebe`; release prep then created `worker-1/release-0.15.0-prep` locally. | PASS |
| Candidate source SHA | `git rev-parse HEAD` before edits returned `b5b6d13134eb86ecda2d9021cc83c0995f943ebe`. | PASS |
| Latest reachable tag | `git describe --tags --abbrev=0` returned `v0.14.3`. | PASS |
| `v0.14.3` ancestry | `git merge-base --is-ancestor v0.14.3 HEAD` returned exit code `0`; `git rev-parse v0.14.3^{}` returned `56c93fd3daed9f6043f0bbb65476d355d47083c5`. | PASS |
| `v0.14.4` ref and ancestry | `git rev-parse v0.14.4^{}` returned `b1f684d706d384a94570023fe51ed5ed751066fb`, but `git merge-base --is-ancestor v0.14.4 HEAD` returned exit code `1`. | PASS: tag exists but is not a valid reachable compare base |

## Scope

`0.15.0` is a minor release candidate covering plugin delivery/Codex App compatibility, Visual Ralph, setup install-mode behavior, native agent/model routing, hook/runtime hardening, Windows/tmux question handling, CI hang protection, Rust compatibility, docs, and release collateral.

## Changed execution paths reviewed

- `package.json`, `package-lock.json`, `Cargo.toml`, `Cargo.lock` — release metadata aligned to `0.15.0`.
- `CHANGELOG.md`, `RELEASE_BODY.md`, `docs/release-notes-0.15.0.md`, `docs/qa/release-readiness-0.15.0.md` — release collateral prepared with verified `v0.14.3` base-range note.
- Plugin/setup/Codex App surfaces — plugin mirror, plugin descriptors, install-mode setup, package bin/layout, and App-safe runtime routing are covered by the required verification gates below.
- Native agent/model routing — native-agent verification and generated docs/model table checks are covered by the required verification gates below.
- Runtime/question/CI/Rust surfaces — compiled test, explore, sparkshell, packed install, and Cargo workspace gates are tracked below.

## Verification evidence

| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| TypeScript build | `npm run build` | PENDING | Not run yet in this release-prep worktree. |
| Lint | `npm run lint` | PENDING | Not run yet in this release-prep worktree. |
| No-unused typecheck | `npm run check:no-unused` | PENDING | Not run yet in this release-prep worktree. |
| Native agent generation check | `npm run verify:native-agents` | PENDING | Not run yet in this release-prep worktree. |
| Plugin bundle / mirror check | `npm run verify:plugin-bundle` | PENDING | Not run yet in this release-prep worktree. |
| Plugin mirror sync check | `npm run sync:plugin:check` | PENDING | Not run yet in this release-prep worktree. |
| Full Node test suite | `npm test` | PENDING | Not run yet in this release-prep worktree. |
| Compiled CI test lane | `npm run test:ci:compiled` | PENDING | Requires build output from this worktree. |
| Explore tests | `npm run test:explore` | PENDING | Requires build output from this worktree. |
| Sparkshell tests | `npm run test:sparkshell` | PENDING | Requires build output from this worktree. |
| Packed install smoke | `npm run smoke:packed-install` | PENDING | Requires build output from this worktree. |
| Rust workspace tests | `cargo test --workspace` | PENDING | Not run yet in this release-prep worktree. |

## Known limits / skipped checks

- External push, GitHub PR creation, GitHub CI, release tag creation, npm publish, and GitHub release publication are intentionally out of scope for this prep task.
- Manual cross-OS checks are not yet run; Windows/tmux coverage currently depends on automated regression suites unless a maintainer runs manual OS validation.

## Verdict

**Blocked until required verification gates are run.** This file must be updated with actual command outcomes before the release owner treats `0.15.0` as ready to tag or publish.
