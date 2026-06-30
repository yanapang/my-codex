# oh-my-codex (OMX)

[![npm version](https://img.shields.io/npm/v/oh-my-codex)](https://www.npmjs.com/package/oh-my-codex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

This repository is both the upstream `oh-my-codex` source tree and my personal Codex workspace.
I use it as the reproducible layer for prompts, skills, hooks, scripts, and machine-to-machine setup, while keeping personal and work knowledge in separate repositories.

Website: https://yeachan-heo.github.io/oh-my-codex-website/

Docs: [Getting Started](./docs/getting-started.html) · [Agents](./docs/agents.html) · [Skills](./docs/skills.html) · [Integrations](./docs/integrations.html) · [Demo](./DEMO.md) · [OpenClaw guide](./docs/openclaw-integration.md)

## How this workspace is organized

This is the working layout I actually use:

- `oh-my-codex` - OMX runtime, CLI, prompts, hooks, templates, and source code.
- `personal-wiki` - Git-synced personal knowledge that is safe to keep in a repo.
- `work-wiki` - Git-synced work knowledge that is safe to keep in a repo.
- `lifeos-template` - sanitized Obsidian vault template for bootstrapping a local LifeOS vault.
- local `LifeOS` vault - private planning, dashboards, journals, raw notes, finance/health/personal material; intentionally not stored in this repo.

The promotion rule is simple:

1. Capture private or raw material in local `LifeOS`.
2. Promote durable personal knowledge into `personal-wiki`.
3. Promote durable shareable work knowledge into `work-wiki`.
4. Promote repeated workflows, automation, and AI runtime behavior into this repo.

## What I use this repo for

This repo is the stable shell around Codex. I use it to:

- keep my OMX setup reproducible across machines
- launch Codex with my preferred orchestration layer
- maintain prompts, skills, agents, templates, and local workflow docs
- sync wiki submodules that hold durable knowledge
- keep local-only sensitive data outside Git

It keeps Codex as the execution engine and makes it easier to:

- start a stronger Codex session by default
- run one consistent workflow from clarification to completion
- invoke the canonical default workflow with `$deep-interview`, `$ralplan`, and `$ultragoal`
- keep project guidance, plans, logs, and state in `.omx/`

## New machine setup

Clone with submodules:

```bash
git clone --recurse-submodules https://github.com/yanapang/my-codex.git
cd my-codex
npm ci
```

If Codex CLI is already installed through Homebrew, npm, or another supported path, verify that first and then install OMX:

```bash
codex --version
npm install -g oh-my-codex
omx setup
```

If you do not have Codex CLI yet and want npm to manage it:

```bash
npm install -g @openai/codex
npm install -g oh-my-codex
omx setup
```

Do not run a combined `npm install -g @openai/codex oh-my-codex` over an existing Homebrew-owned `codex` binary such as `/opt/homebrew/bin/codex`; npm may fail with `EEXIST` when `@openai/codex` tries to create the same binary.

After setup, verify both the install and the real execution path:

```bash
omx doctor
codex login status
omx exec --skip-git-repo-check -C . "Reply with exactly OMX-EXEC-OK"
```

Then initialize the local LifeOS path if this machine uses one:

```bash
npm run lifeos:doctor
npm run lifeos:path
```

By default the local vault path is `../LifeOS`. If your vault lives elsewhere, create an ignored `.lifeos.local.json`:

```json
{
  "vaultPath": "../LifeOS"
}
```

## Daily usage

### 1. Sync the workspace

For the parent repo:

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

To move the wiki/template submodules to their latest tracked `main` branch commits:

```bash
git submodule update --remote --merge personal-wiki work-wiki lifeos-template
```

If prompts, hooks, or packaged runtime files changed after pulling, refresh the local OMX surface:

```bash
npm ci
npm run setup
npm run doctor
```

### 2. Launch a working session

This is my normal launch shape from a Git repo:

```bash
omx --worktree=feat/task --madmax --xhigh
```

`--madmax` is OMX shorthand for Codex `--dangerously-bypass-approvals-and-sandbox`. I only use it in trusted repos and I prefer a worktree launch so the session is isolated.

If I want a lighter direct launch without OMX tmux/HUD management:

```bash
omx --direct --yolo
```

On macOS/Linux, the recommended Team and HUD experience depends on the OMX tmux runtime. In Codex App or outside tmux, those runtime features are not directly available in the same way; the app-safe fallback is to launch OMX CLI from shell first when I need the full tmux runtime or CLI runtime behavior.

### 3. Run the default workflow

The standard workflow built around `$deep-interview` -> `$ralplan` -> `$ultragoal` is still the default path in this workspace.

```text
/goal Create a safe authentication refactor plan, implement it, and verify login, logout, and refresh-token behavior.

$deep-interview "clarify the authentication change"
$ralplan "approve the auth plan and review tradeoffs"
$prometheus-strict "stress-test the plan before durable execution"
$ultragoal "turn the approved plan into durable Codex goals"
```

Use `$team` inside that execution path only when a specific Ultragoal story needs coordinated parallel work.
Use `$ralph` as an intentional alternate completion loop.

### 4. Put notes in the right place

- local `LifeOS` - private planning, weekly review, dashboards, sensitive notes
- `personal-wiki` - reusable personal learning notes, project notes, decisions
- `work-wiki` - reusable work context, project logs, presentation drafts
- this repo - reusable automation, prompts, templates, configuration, docs

## Submodule and LifeOS maintenance

The reproducible knowledge stores are Git submodules:

- [`personal-wiki`](./personal-wiki/) - personal learning, projects, decisions, and logs
- [`work-wiki`](./work-wiki/) - work-only project context, logs, and presentation notes
- [`lifeos-template`](./lifeos-template/) - sanitized LifeOS Obsidian vault template

Useful commands:

```bash
git submodule status
git submodule update --init --recursive
git submodule update --remote --merge personal-wiki work-wiki lifeos-template
npm run lifeos:doctor
npm run lifeos:path
```

When a submodule changes:

1. Commit inside the submodule repo first.
2. Return to the parent repo.
3. Commit the updated submodule pointer here.

Do not commit private LifeOS data back into `lifeos-template`.

## Developing this repo itself

I use the same checkout both as a workspace and as the actual `oh-my-codex` source tree.

Common commands:

```bash
npm run build
npm run lint
npm test
npm run doctor
```

Additional local helpers:

```bash
npm run lifeos:doctor
npm run lifeos:path
```

What should stay in Git:

- source changes under `src/`, `crates/`, `docs/`, `prompts/`, `skills/`, `templates/`, and `plugins/`
- repo-level workflow docs and setup notes
- reproducible helper scripts and automation

What should stay local:

- `node_modules/`
- `dist/`
- `target/`
- `.omx/`
- `.codex/`
- local auth state, secrets, and private notes

## Plugin and setup note

This repo also ships an official Codex plugin layout at `plugins/oh-my-codex` with marketplace-aware cache semantics under `plugins/cache/$MARKETPLACE_NAME/oh-my-codex/$VERSION/`.
That plugin is not a replacement for `npm install -g oh-my-codex` plus `omx setup`.
The legacy setup mode installs native agents and prompts, while plugin setup mode archives stale legacy prompt/native-agent files and provides plugin-scoped companion metadata for official Codex lifecycle hooks.
Legacy setup mode installs prompts/native agents and `.codex/hooks.json`, while plugin mode keeps those legacy/fallback native Codex hook registrations setup-owned instead of treating the plugin as a full runtime replacement.

## Upstream reference

The official/original OMX project is [`Yeachan-Heo/oh-my-codex`](https://github.com/Yeachan-Heo/oh-my-codex), and the official npm package is [`oh-my-codex`](https://www.npmjs.com/package/oh-my-codex).
This repo is my personal working fork and workspace built around that project.
