# oh-my-codex v0.9.0

<p align="center">
  <img src="./shared/omx-character-spark-initiative.jpg" alt="OMX character sparked for the Spark Initiative" width="720">
</p>

`0.9.0` is the Spark Initiative release: OMX now has a stronger native fast path for repository discovery, shell-native inspection, and cross-platform native distribution.

## Highlights

### `omx explore`

- adds a dedicated read-only exploration entrypoint
- uses a Rust-backed explore harness
- keeps shell-native exploration constrained, allowlisted, and read-only
- supports packaged native resolution plus source/repo-local fallback paths

### `omx sparkshell`

- adds an operator-facing native shell sidecar
- supports direct command execution
- summarizes long output into compact sections
- supports explicit tmux-pane summarization:

```bash
omx sparkshell --tmux-pane %12 --tail-lines 400
```

### Explore ↔ sparkshell integration

- qualifying read-only shell-native `omx explore` prompts can route through `omx sparkshell`
- fallback behavior remains explicit and hardened
- guidance/docs/tests were aligned around this contract

### Release pipeline upgrades

- cross-platform native publishing for:
  - `omx-explore-harness`
  - `omx-sparkshell`
- native release manifest generation with per-target metadata
- packed-install smoke verification in the release workflow
- `build:full` validated as the one-shot release-oriented build path

## Upgrade note

If you use project-scoped OMX installs, rerun:

```bash
omx setup --force --scope project
```

after upgrading so managed config/native-agent paths are refreshed.

## Local release verification summary

Validated locally on `dev` before tagging:

- `node scripts/check-version-sync.mjs --tag v0.9.0`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run check:no-unused`
- `npm test`
- `npm run build:full`
- `npm run test:explore`
- `npm run test:sparkshell`
- `node bin/omx.js doctor`
- `node bin/omx.js setup --dry-run`
- `npm pack --dry-run`

## Notable PRs

- `#782` — explore routes qualifying read-only shell tasks via sparkshell
- `#784` — cross-platform native publishing and release-pipeline follow-through
- `#785` — team runtime lifecycle and cleanup hardening
- `#786` — nested help routing cleanup
- `#787` — centralized OMX default model resolution
- `#788` — HUD branch/config loading hardening
- `#789` — distribute generated aspect tasks across workers
- `#793` — Windows Codex command shim probing fix
- `#794` — merge `experimental/dev` into `dev`
