# oh-my-codex v0.10.0

**54 commits | 26 PRs | 105 files changed | +7,581 / −388 lines**

## Highlights

- **`omx autoresearch`** _(experimental)_ — new autonomous research mode that iteratively explores topics and self-terminates on exhaustion
- **`omx exec` wrapper** — run commands through the OMX orchestration layer directly
- **Team worktrees by default** — team workers now get isolated git worktrees automatically, improving parallel safety
- **Deep-interview intent-first** — intent classification happens upfront before the Socratic loop
- **Incremental worktree merge tracking** — smarter conflict detection with incremental merge state

## What's Changed

### Features
- feat: enforce team worktrees by default ([#804](https://github.com/Yeachan-Heo/oh-my-codex/pull/804))
- feat: make deep-interview intent-first ([#829](https://github.com/Yeachan-Heo/oh-my-codex/pull/829))
- feat(cli): add first-pass omx exec wrapper ([#832](https://github.com/Yeachan-Heo/oh-my-codex/pull/832))
- feat(team): add incremental worktree merge tracking ([#846](https://github.com/Yeachan-Heo/oh-my-codex/pull/846))
- feat(autoresearch): new autonomous research mode _(experimental)_ ([#847](https://github.com/Yeachan-Heo/oh-my-codex/pull/847), [#849](https://github.com/Yeachan-Heo/oh-my-codex/pull/849))

### Bug Fixes
- fix(release): localize smoke hydration assets ([#806](https://github.com/Yeachan-Heo/oh-my-codex/pull/806))
- fix: preserve macOS clipboard image paste path ([#810](https://github.com/Yeachan-Heo/oh-my-codex/pull/810), [#809](https://github.com/Yeachan-Heo/oh-my-codex/issues/809))
- fix: fall back when sparkshell hits glibc mismatch ([#813](https://github.com/Yeachan-Heo/oh-my-codex/pull/813), [#812](https://github.com/Yeachan-Heo/oh-my-codex/issues/812))
- fix(tmux): stop leaking server-global mouse state ([#820](https://github.com/Yeachan-Heo/oh-my-codex/pull/820), [#817](https://github.com/Yeachan-Heo/oh-my-codex/issues/817))
- fix(team): make team HUD full-width ([#822](https://github.com/Yeachan-Heo/oh-my-codex/pull/822))
- fix: project setup .omx gitignore sync ([#824](https://github.com/Yeachan-Heo/oh-my-codex/pull/824), [#823](https://github.com/Yeachan-Heo/oh-my-codex/issues/823))
- fix(config): merge existing notify and tui entries ([#826](https://github.com/Yeachan-Heo/oh-my-codex/pull/826), [#825](https://github.com/Yeachan-Heo/oh-my-codex/issues/825))
- fix(pipeline): unify planning-complete artifact checks ([#828](https://github.com/Yeachan-Heo/oh-my-codex/pull/828), [#827](https://github.com/Yeachan-Heo/oh-my-codex/issues/827))
- fix: preserve post-ralplan team follow-up context ([#833](https://github.com/Yeachan-Heo/oh-my-codex/pull/833))
- fix(setup): default user skills to CODEX_HOME ([#839](https://github.com/Yeachan-Heo/oh-my-codex/pull/839))
- fix(hooks): auto-expand active Ralph max_iterations ([#843](https://github.com/Yeachan-Heo/oh-my-codex/pull/843), [#842](https://github.com/Yeachan-Heo/oh-my-codex/issues/842))
- fix(setup): validate skills before install ([#845](https://github.com/Yeachan-Heo/oh-my-codex/pull/845), [#844](https://github.com/Yeachan-Heo/oh-my-codex/issues/844))
- fix(team): continuous worktree integration with hybrid merge, auto-commit, and cross-worker rebase ([#852](https://github.com/Yeachan-Heo/oh-my-codex/pull/852))
- fix(cli): harden Windows psmux detached bootstrap ([#854](https://github.com/Yeachan-Heo/oh-my-codex/pull/854), closes [#853](https://github.com/Yeachan-Heo/oh-my-codex/issues/853))

### Documentation & Internal
- docs(deep-interview): make execution handoff contract explicit ([#851](https://github.com/Yeachan-Heo/oh-my-codex/pull/851))
- test(team): isolate dirty-worktree helpers
- Removed unused `sendRebaseConflictMessageToWorker` function
- Reverted crates runtime CI alignment after compatibility issues ([#840](https://github.com/Yeachan-Heo/oh-my-codex/pull/840))

## Contributors

- [@Yeachan-Heo](https://github.com/Yeachan-Heo) — 52 commits
- [@HaD0Yun](https://github.com/HaD0Yun) — 2 commits

**Full Changelog**: [`v0.9.1...v0.10.0`](https://github.com/Yeachan-Heo/oh-my-codex/compare/v0.9.1...v0.10.0)
